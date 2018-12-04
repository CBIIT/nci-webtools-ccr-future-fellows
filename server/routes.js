const Router = require('koa-router');
const Body = require('koa-body');
const lodash = require('lodash');
const {
    addApplicant
} = require('./controllers');

const router = new Router();

// add template variables/libraries (ctx.state)
router.use((ctx, next) => {
    ctx.state._ = lodash;
    ctx.state.route = ctx._matchedRoute;
    ctx.state.method = ctx.request.method;
    return next();
});

// use multipart/form-data for the following routes
router.use(['/apply'], Body({multipart: true}))

// register routes for each page
router.get('/', ctx => ctx.render('pages/index'));

router.get('/auth', ctx => ctx.render('pages/auth'));

router.get('/apply', ctx => ctx.render('pages/apply', {
    fields: ctx.lookupTables, // lookup tables for form fields
    errors: null, // form validation errors
    values: {job_category_id: '1'}, // default form values
}));

router.post('/apply', async ctx => ctx.render('pages/apply', {
    fields: ctx.lookupTables, // lookup tables for form fields
    errors: await addApplicant(ctx), // if null, applicant was added successfully
    values: ctx.request.body, // use previously submitted values for form
}));

module.exports = router.routes();
