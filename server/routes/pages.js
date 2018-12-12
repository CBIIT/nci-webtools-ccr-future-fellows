const Router = require('koa-router');
const body = require('koa-body')({multipart: true});
const { addApplicant, searchApplicants, getUsers } = require('../controllers/applicants');
const router = new Router();

// register page routes
router.get('/', ctx => {
    if (ctx.session.authenticated)
        return ctx.redirect('/search');
    else
        return ctx.render('pages/index')
});

router.get('/auth', ctx => {
    ctx.session.authenticated = true;
    ctx.redirect('/search');
});

router.get('/logout', ctx => {
    ctx.session.authenticated = false;
    ctx.redirect('/');
});

router.get('/apply', ctx => ctx.render('pages/apply', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: {job_category_id: '1'}, // default form values
    errors: null, // form validation errors (null)
}));

router.post('/apply', body, async ctx => ctx.render('pages/apply', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: ctx.request.body, // use previously submitted values for form
    errors: await addApplicant(ctx), // contains validation errors, if they exist
}));

router.get('/search', ctx => ctx.render('pages/search', {
    fields: ctx.lookupTables, // use lookup tables for form fields
}));

router.post('/search', body, async ctx => ctx.render('pages/search-results', {
    applicants: await searchApplicants(ctx.request)
}));

router.get('/applicants', async ctx => ctx.render('pages/applicants', {
    applicants: await searchApplicants(ctx)
}));

router.post('/applicants', async ctx => ctx.render('pages/applicants', {
    applicants: await searchApplicants(ctx)
}));

router.get('/applicants/add', async ctx => ctx.render('pages/add-applicant', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: {job_category_id: '1'}, // default form values
    errors: null, // form validation errors (null)
}));

router.get('/user-track', async ctx => ctx.render('pages/user-track', {
    users: await getUsers()
}));

module.exports = router.routes();
