var Router = require('koa-router');
var body = require('koa-body');
var router = new Router();

const {
    getLookupTables,
    searchApplicants,
    addApplicant,
    updateApplicant,
    validateApplicant
} = require('./controllers');

router.get('/', ctx => ctx.render('index'));
router.get('/auth', ctx => ctx.render('auth'));

router.get('/apply', ctx => ctx.render('apply', {
    fields: ctx.lookupTables, // form fields
    formValues: {job_category: '1'} // default form values
}));


// router.post('/apply', body({multipart: true}), ctx => console.dir(ctx.request.body))

router.post('/apply', body({multipart: true}), ctx => {
    const errors = validateApplicant(ctx.request);
    const alerts = [];

    if (!Object.keys(errors)) {
        alerts.push({
            type: 'success',
            message: 'Your application has been submitted.'
        })
    } else {
        alerts.push({
            type: 'warning',
            message: 'Please correct the errors below and resubmit your application.'
        });
    }

    return ctx.render('apply', {
        fields: ctx.lookupTables,
        formValues: ctx.request.body,
        errors: errors,
        alerts: alerts,
    });
});


module.exports = router.routes();
