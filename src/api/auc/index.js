import Router from "koa-router";
import Auc from "../../models/auc";
import Joi from "joi";

const auc = new Router();

/*
GET /auc 가장 많이 검색한 아이템 조회
POST /auc/:id 평균판매가 저장
GET /auc/:id 아이템 평균판매가 조회
*/

const freqSearch = async ctx => {
	try {
		const items = await Auc.aggregate([
			{
				$group: {
					_id: "$itemId",
					"count": {$sum: 1}
				},
			},
			{
				$count: "all",
			},
		]).exec();
		ctx.body = items;
	} catch (e) {
		ctx.throw(500, e);
	}
};

const avgSave = async ctx => {
	// 유효값 검증
	const schema = Joi.object().keys({
		date: Joi.date().required(),
		itemName: Joi.string().required(),
		itemId: Joi.string().required(),
		avgPrice: Joi.number().required(),
	});

	const result = Joi.validate(ctx.request.body, schema);
	if (result.error) {
		ctx.status = 400; // Bad request
		ctx.body = result.error;
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
		} catch (e) {
			ctx.throw(500, e);
		}
	} else {
		ctx.body = "Already saved.";
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

auc.get("/", freqSearch);
auc.post("/:id", avgSave);
auc.get("/:id", avgList);

export default auc;
