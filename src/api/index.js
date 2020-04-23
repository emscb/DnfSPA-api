import Router from 'koa-router';
import auc from './auc';

const api = new Router();

api.use('/auc', auc.routes());

export default api;
