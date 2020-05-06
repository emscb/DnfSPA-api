import Router from "koa-router";
import auc from "./auc";
import config from "./config";

const api = new Router();

api.use("/auc", auc.routes());
api.use("/config", config.routes());

export default api;
