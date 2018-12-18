const Router = require('koa-router');
const lodash = require('lodash');
const router = new Router();

// add template variables/libraries (ctx.state)
router.use((ctx, next) => {
    ctx.state._ = lodash;
    ctx.state.session = ctx.session;
    ctx.state.route = ctx._matchedRoute;
    ctx.state.method = ctx.request.method;
    return next();
});

module.exports = router.routes();
