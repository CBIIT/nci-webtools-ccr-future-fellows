const Router = require('koa-router');
const users = require('../controllers/users');
const router = new Router();

/** User Track Pages */
router.get('/user-track', async ctx => ctx.render('user-track/users', {
    users: await users.list()
}));

router.get('/user-track/:username', async ctx => ctx.render('user-track/user-actions', {
    username: ctx.params.username,
    actions: await users.getActions(ctx.params.username)
}));

module.exports = router.routes();
