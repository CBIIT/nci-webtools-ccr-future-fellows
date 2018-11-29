const Router = require('koa-router');
const Body = require('koa-body');
const { addApplicant } = require('./controllers');
const router = new Router();

// add template variables (ctx.state)
router.use((ctx, next) => {
    ctx.state.route = ctx._matchedRoute;
    ctx.state.method = ctx.request.method;
    return next();
});

// use multipart/form-data for the following routes
router.use(['/apply'], Body({multipart: true}))

router.get('/', ctx => ctx.render('pages/index'));

router.get('/auth', ctx => ctx.render('pages/auth'));

router.get('/apply', ctx => ctx.render('pages/apply', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    formErrors: null, // form validation errors (null)
    formValues: {job_category_id: '1'}, // default form values
}));

router.post('/apply', async ctx => ctx.render('pages/apply', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    formErrors: await addApplicant(ctx), // if no errors, applicant was added successfully
    formValues: ctx.request.body, // use previously submitted values for form
}));

module.exports = router.routes();
