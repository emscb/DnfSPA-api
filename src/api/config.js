import Router from "koa-router";
import Config from "../models/config";

const config = new Router();

// 전제 설정 검색
const getConfig = async ctx => {
	const c = new Config({
		item: "dbsync",
		content: "2020-05-06",
	});
	await c.save();
	ctx.body = "Saved";

	// try {
	// 	const configs = await Config.find().exec();
	// 	ctx.body = configs;
	// } catch (e) {
	// 	ctx.throw(500, e);
	// }
};

config.get("/", getConfig);

export default config;
