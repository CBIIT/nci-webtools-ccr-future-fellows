const Router = require('koa-router');
const users = require('../controllers/users');
const router = new Router();

/** User Track Pages */
router.get('/user-track', async ctx => ctx.render('user-track/users', {
    users: await users.list()
}));

router.get('/user-track/:id', async ctx => ctx.render('user-track/user-dates', {
    dates: await users.getUserDates(ctx.params.id)
}));

router.get('/user-track/:id/:date', async ctx => ctx.render('user-track/user-actions', {
    actions: await users.getUserActions(ctx.params.id, ctx.params.date)
}));

module.exports = router.routes();
