const Router = require('koa-router');
const router = new Router();

router.use(require('./middleware'));
router.use(require('./pages'));

module.exports = router.routes();
