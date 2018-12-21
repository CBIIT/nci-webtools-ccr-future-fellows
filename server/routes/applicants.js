const Router = require('koa-router');
const applicants = require('../controllers/applicants');
const body = require('koa-body')({multipart: true});
const send = require('koa-send');
const router = new Router();
const useRole = role => (ctx, next) => next();

// clear previous messages (alerts)
router.use((ctx, next) => {
    ctx.session.message = null;
    return next();
});

/** Public Application Pages */
router.get('/apply', ctx => ctx.render('applicants/apply', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: {job_category_id: '1'}, // default form values
    errors: null, // form validation errors (null)
}));

router.post('/apply', body, async ctx => ctx.render('applicants/apply', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: ctx.request.body, // use previously submitted values for form
    errors: await applicants.add(ctx), // contains validation errors, if they exist
}));

/** Applicants Page */
router.get('/applicants', useRole('user'), async ctx => ctx.render('applicants/list', {
    applicants: await applicants.search(ctx)
}));

/** New Applicant Pages */
router.get('/applicants/add', useRole('admin'), async ctx => ctx.render('applicants/add', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: {job_category_id: '1', status: 'pending'}, // default form values
    errors: null, // form validation errors (null)
}));

router.post('/applicants/add', useRole('admin'), async ctx => ctx.render('applicants/add', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: ctx.request.body, // use previously submitted values for form
    errors: await applicants.add(ctx), // contains validation errors, if they exist
}));

/** Update Applicant Pages */
router.get('/applicants/:id', useRole('admin'), async ctx => ctx.render('applicants/update', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: await applicants.get(ctx.params.id), // use previously submitted values for form
    errors: null, // contains validation errors, if they exist
}));

router.post('/applicants/:id', useRole('admin'), body, async ctx => ctx.render('applicants/update', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: ctx.request.body, // use previously submitted values for form
    errors: await applicants.update(ctx), // contains validation errors, if they exist
}));

router.get('/applicants/approve/:id', useRole('admin'), async ctx => {
    await applicants.approve(ctx.params.id);
    ctx.redirect('/applicants');
    ctx.session.message = 'Applicant Approved';
});

router.get('/applicants/remove/:id', useRole('admin'), async ctx => {
    await applicants.remove(ctx.params.id);
    ctx.redirect('/applicants');
    ctx.session.message = 'Applicant Removed';
});

router.get('/applicants/resume/:id', useRole('user'), async ctx => {
    const { resume_file } = await applicants.get(ctx.params.id);
    // ctx.attachment(`${last_name}_${first_name}_Resume.pdf`);
    await send(ctx, resume_file);
});

router.get('/applicants/export/:id', useRole('user'), async ctx => {
    const { first_name, last_name } = await applicants.get(ctx.params.id);
    ctx.attachment(`${last_name}_${first_name}.zip`);
    ctx.body = await applicants.generateExport(ctx);
});

/** Search Pages */
router.get('/search', useRole('user'), ctx => ctx.render('applicants/search', {
    fields: ctx.lookupTables, // use lookup tables for form fields,
}));

router.post('/search', useRole('user'), body, async ctx => ctx.render('applicants/search-results', {
    applicants: await applicants.search(ctx.request)
}));

module.exports = router.routes();