const Router = require('koa-router');
const body = require('koa-body')({multipart: true});
const send = require('koa-send');
const applicants = require('../controllers/applicants');
const users = require('../controllers/users');
const mailer = require('../components/mailer');
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
const useRole = role => (ctx, next) => {
    const user = ctx.session.user;
    if (user && user.role == 'admin' || user.role == role) {
        return next();
    } else {
        return ctx.redirect('/');
    }
}

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
router.get('/applicants/:id', useRole('admin'), async ctx => {
    const applicant = await applicants.get(ctx.params.id);
    const target = `${applicant.last_name}, ${applicant.first_name}`;
    users.trackAction(ctx.session.user, VIEWED_DETAILS, target);

    return ctx.render('applicants/update', {
        fields: ctx.lookupTables, // use lookup tables for form fields
        values: applicant, // use previously submitted values for form
        errors: null, // contains validation errors, if they exist
    })
});

router.post('/applicants/:id', useRole('admin'), body, async ctx => ctx.render('applicants/update', {
    fields: ctx.lookupTables, // use lookup tables for form fields
    values: ctx.request.body, // use previously submitted values for form
    errors: await applicants.update(ctx), // contains validation errors, if they exist
}));

router.get('/applicants/approve/:id', useRole('admin'), async ctx => {
    const applicant = await applicants.get(ctx.params.id);
    const target = `${applicant.last_name}, ${applicant.first_name}`;
    users.trackAction(ctx.session.user, APPROVED_APPLICANT, target);

    await applicants.approve(ctx.params.id);
    ctx.redirect('/applicants');
    ctx.session.message = 'Applicant Approved';
});

router.get('/applicants/remove/:id', useRole('admin'), async ctx => {
    const applicant = await applicants.get(ctx.params.id);
    const target = `${applicant.last_name}, ${applicant.first_name}`;
    users.trackAction(ctx.session.user, REMOVED_APPLICANT, target);

    await applicants.remove(ctx.params.id);
    ctx.redirect('/applicants');
    ctx.session.message = 'Applicant Removed';
});

router.get('/applicants/resume/:id', useRole('user'), async ctx => {
    const applicant = await applicants.get(ctx.params.id);
    const target = `${applicant.last_name}, ${applicant.first_name}`;
    users.trackAction(ctx.session.user, VIEWED_RESUME, target);

    const { resume_file } = applicant;
    // ctx.attachment(`${last_name}_${first_name}_Resume.pdf`);
    await send(ctx, resume_file);
});

router.get('/applicants/export/:id', useRole('user'), async ctx => {
    const applicant = await applicants.get(ctx.params.id);
    const target = `${applicant.last_name}, ${applicant.first_name}`;
    users.trackAction(ctx.session.user, DOWNLOADED_FILES, target);

    const { first_name, last_name } = applicant;
    ctx.attachment(`${last_name}_${first_name}.zip`);
    ctx.body = await applicants.generateExport(ctx);
});

router.get('/applicants/email/:id', useRole('user'), async ctx => {
    const applicant = await applicants.get(ctx.params.id);
    const target = `${applicant.last_name}, ${applicant.first_name}`;
    users.trackAction(ctx.session.user, EMAILED_FILES, target);

    const email = ctx.session.user.email;
    const name = `${applicant.first_name} ${applicant.last_name}`;

    await mailer.sendMail({
        from: 'noreply@nih.gov',
        to: email,
        subject: `Future Fellows Applicant: ${name}`,
        html: `
            Date: ${new Date().toLocaleDateString()} <br>
            The applicant files for <b>${name}</b> are attached.`,
        attachments: [{
            filename: `${name}.zip`,
            content: await applicants.generateExport(ctx)
        }]
    });

    ctx.redirect(`/applicants/${ctx.params.id}`);
    ctx.session.message = `Email has been sent to ${email}`;
});


/** Search Pages */
router.get('/search', useRole('user'), ctx => ctx.render('applicants/search', {
    fields: ctx.lookupTables, // use lookup tables for form fields,
}));

router.post('/search', useRole('user'), body, async ctx => {
    users.trackAction(ctx.session.user, SEARCHED_APPLICANTS, null);
    return ctx.render('applicants/search-results', {
        applicants: await applicants.search(ctx.request)
    });
});

module.exports = router.routes();