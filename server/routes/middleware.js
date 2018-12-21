const Router = require('koa-router');
const _ = require('lodash');
const router = new Router();

// add template variables/libraries (ctx.state)
router.use((ctx, next) => {
    ctx.state._ = _;
    ctx.state.router = ctx.router;
    ctx.state.params = ctx.params;
    ctx.state.session = ctx.session;
    ctx.state.route = ctx._matchedRoute;
    ctx.state.url = ctx.req.url;
    ctx.state.method = ctx.request.method;
    return next();
});

router.use((ctx, next) => {
    ctx.response.set('Turbolinks-Location', ctx.req.url);
    return next();
})

module.exports = router.routes();
