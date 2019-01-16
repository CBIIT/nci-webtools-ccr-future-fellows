const Router = require('koa-router');
const config = require('../../config.json');
const users = require('../controllers/users');
const {
    LOGGED_IN,
    VIEWED_DETAILS,
    VIEWED_RESUME,
    DOWNLOADED_FILES,
    EMAILED_FILES,
    REMOVED_APPLICANT,
    APPROVED_APPLICANT,
    SEARCHED_APPLICANTS,
} = users.ACTIONS;

const router = new Router();

/** Index Page */
router.get('/', ctx => {
    if (ctx.session.authenticated)
        return ctx.redirect('/search');
    else
        return ctx.render('index');
});

/** Login Route (redirects to search) */
router.get('/login', ctx => {
    let { session } = ctx;
    if (!config.production) {
        session.authenticated = true;
        session.user = config.development.user;
        users.trackAction(session.user, LOGGED_IN);
        ctx.redirect('/search');
    } else {
        ctx.redirect('/');
    }
});

/** Logout Route (redirects to index) */
router.get('/logout', ctx => {
    ctx.session.authenticated = false;
    ctx.session.user = {}
    ctx.redirect('/');
});

/** Heartbeat api */
router.get('/ping', ctx => ctx.body = 'true');

module.exports = router.routes();
