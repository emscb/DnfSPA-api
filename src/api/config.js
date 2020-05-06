import Router from "koa-router";
import Config from "../models/config";

const config = new Router();

// 전제 설정 검색
const getConfig = async ctx => {
	try {
		const configs = await Config.find().exec();
		var info = {};
		for (let a = 0; a < configs.length; a++) {
			info = { ...info, [configs[a].item]: configs[a].content };
		}
		ctx.body = info;
	} catch (e) {
		ctx.throw(500, e);
	}
};

config.get("/", getConfig);

export default config;
