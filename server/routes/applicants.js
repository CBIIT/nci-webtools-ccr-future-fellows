const Router = require('koa-router');
const applicants = require('../controllers/applicants');
const body = require('koa-body')({multipart: true});
const authenticateRole = role => (ctx, next) => next();

/** Public Application Pages */
router.get('/apply', ctx => ctx.render('applicants/create', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: {job_category_id: '1'}, // default form values
    errors: null, // form validation errors (null)
}));

router.post('/apply', body, async ctx => ctx.render('applicants/create', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: ctx.request.body, // use previously submitted values for form
    errors: await applicants.add(ctx), // contains validation errors, if they exist
}));

/** New Applicant Pages */
router.get('/new-applicant', authenticateRole('admin'), async ctx => ctx.render('applicants/create', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: {job_category_id: '1'}, // default form values
    errors: null, // form validation errors (null)
}));

router.post('/new-applicant', authenticateRole('admin'), async ctx => ctx.render('applicants/create', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: ctx.request.body, // use previously submitted values for form
    errors: await applicants.add(ctx), // contains validation errors, if they exist
}));

/** Update Applicant Pages */
router.get('/applicant/:applicant_id', authenticateRole('admin'), async ctx => ctx.render('applicants/update', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: await applicants.get(ctx), // use previously submitted values for form
    errors: null, // contains validation errors, if they exist
}));

router.post('/applicant/:applicant_id', authenticateRole('admin'), body, async ctx => ctx.render('applicants/update', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: ctx.request.body, // use previously submitted values for form
    errors: await applicants.update(ctx), // contains validation errors, if they exist
}));

/** Search Pages */
router.get('/search', authenticateRole('user'), ctx => ctx.render('applicants/search', {
    fields: ctx.lookupTables, // use lookup tables for form fields,
}));

router.post('/search', authenticateRole('user'), body, async ctx => ctx.render('applicants/search-results', {
    applicants: await applicants.search(ctx.request)
}));

/** Applicants Page */
router.get('/applicants', authenticateRole('user'), ctx => ctx.render('applicants/list', {
    applicants: await applicants.search(ctx)
}));

module.exports = router.routes();