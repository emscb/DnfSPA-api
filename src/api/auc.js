import Router from "koa-router";
import Auc from "../models/auc";
import Config from "../models/config";
import Joi from "joi";
import logger from "../../logger";

const auc = new Router();

/*
GET /auc 가장 많이 검색한 아이템 조회
POST /auc/:id 평균판매가 저장
GET /auc/:id 아이템 평균판매가 조회
*/

const schema = Joi.object().keys({
	date: Joi.date().required(),
	itemName: Joi.string().required(),
	itemId: Joi.string().required(),
	avgPrice: Joi.number().required(),
});

const freqSearch = async ctx => {
	logger.info("최빈 검색 아이템 조회");
	const date = new Date();
	let day_ago;
	date.setDate(date.getDate() - 7);
	day_ago = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
	try {
		const items = await Auc.aggregate([
			{
				$match: {
					date: { $gte: new Date(day_ago) },
				},
			},
			{
				$group: {
					_id: { name: "$itemName", id: "$itemId" },
					count: { $sum: 1 },
				},
			},
			{
				$sort: {
					count: -1,
				},
			},
		])
			.limit(8)
			.exec();
		ctx.body = items;
	} catch (e) {
		ctx.throw(500, e);
		logger.error(`최빈 검색 아이템 조회 실패 (500) ${e}`);
	}
};

const avgSave = async ctx => {
	logger.info("평균판매가 저장 요청");
	// 유효값 검증
	const result = Joi.validate(ctx.request.body, schema);
	if (result.error) {
		ctx.status = 400; // Bad request
		ctx.body = result.error;
		logger.error(
			`${
				ctx.request.body.itemName == undefined ? "" : ctx.request.body.itemName
			}평균판매가 저장 실패 (400)`
		);
		return;
	}

	const { date, itemName, itemId, avgPrice } = ctx.request.body;

	// 중복 체크
	const check = await Auc.find({
		date: date,
		itemId: itemId,
	}).exec();
	if (check.length === 0) {
		const auc = new Auc({
			date,
			itemName,
			itemId,
			avgPrice,
		});
		try {
			await auc.save();
			ctx.body = auc;
			logger.info(`${itemName} saved.`);
		} catch (e) {
			ctx.throw(500, e);
			logger.error(`${itemName} 평균판매가 저장 실패 (500) ${e}`);
		}
	} else {
		ctx.body = "Already exist.";
		logger.info(`${itemName} already exist.`);
	}
};

const avgList = async ctx => {
	try {
		const prices = await Auc.find({ itemId: ctx.params.id }).exec();
		ctx.body = prices;
	} catch (e) {
		ctx.throw(500, e);
	}
};

const dbSync = async ctx => {
	const sync_date = ctx.params.date;
	logger.info(`${sync_date} DB 동기화 요청`);
	const itemList = ctx.request.body.list;
	if (itemList == undefined) {
		ctx.status = 400;
		ctx.body = "No data received.";
		logger.error(`${sync_date} 데이터 누락`);
	}

	try {
		for (let a = 0; a < itemList.length; a++) {
			const itemObj = JSON.parse(itemList[a]);
			const { date, itemName, itemId, avgPrice } = itemObj;

			// 데이터 검증
			const result = Joi.validate({ date, itemName, itemId, avgPrice }, schema);
			if (result.error) {
				ctx.status = 400; // Bad request
				ctx.body = result.error;
				logger.error(`${sync_date} DB 동기화 데이터 검증 오류 (400)`);
				return;
			}

			const item = new Auc({
				date,
				itemName,
				itemId,
				avgPrice,
			});
			await item.save();
		}
		ctx.status = 201;
		ctx.body = "Saved";
		logger.info(`${sync_date} DB 동기화 완료`);
	} catch (e) {
		ctx.throw(500, e);
	}

	await Config.updateOne(
		{
			item: "dbsync",
		},
		{
			$set: { content: sync_date },
		}
	);
	logger.info(`DB 동기화 날짜 최신화 완료`);
};

auc.get("/", freqSearch);
auc.post("/:id", avgSave);
auc.get("/:id", avgList);
auc.put("/:date", dbSync);

export default auc;
