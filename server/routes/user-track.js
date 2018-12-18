const Router = require('koa-router');
const users = require('../controllers/users');
const router = new Router({
    prefix: '/user-track'
});

/** User Track Pages */
router.get('/', async ctx => ctx.render('user-track/users', {
    users: await users.list()
}));

router.get('/:id', async ctx => ctx.render('user-track/user-dates', {
    dates: await users.getUserDates(ctx.params.id)
}));

router.get('/:id/:date', async ctx => ctx.render('user-track/user-actions', {
    actions: await users.getUserActions(ctx.params.id, ctx.params.date)
}));

module.exports = router.routes();
