const Router = require('koa-router');
const config = require('../../config.json');
const router = new Router();

/** Index Page */
router.get('/', ctx => {
    if (ctx.session.authenticated)
        return ctx.redirect('/search');
    else
        return ctx.render('index');
});

/** Login Route (redirects to search) */
router.get('/auth', ctx => {
    let { session } = ctx;
    if (!config.production) {
        session.authenticated = true;
        session.role = 'admin';
        session.user_id = 'admin';
        session.first_name = 'test';
        session.last_name = 'admin';
        ctx.redirect('/search');
    }
});

/** Logout Route (redirects to index) */
router.get('/logout', ctx => {
    ctx.session.authenticated = false;
    ctx.redirect('/');
});

/** Heartbeat api */
router.get('/ping', ctx => ctx.body = 'true');

module.exports = router.routes();
