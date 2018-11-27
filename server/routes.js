const { get, post, put } = require('koa-route');
const {
    getLookupTables,
    searchApplicants,
    addApplicant,
    updateApplicant
} = require('./controllers');

const defaults = {
    title: 'Future Fellows'
};

module.exports = [
    get('/', ctx => ctx.render('index', {...defaults})),

    get('/api/lookup_tables', async ctx => ctx.body = await getLookupTables()),
    get('/api/applicants', async ctx => ctx.body = await searchApplicants(ctx.request.query)),
    post('/api/applicants', async ctx => ctx.body = await addApplicant(ctx.request)),
    put('/api/applicants', async ctx => ctx.body = await updateApplicant(ctx.request)),
];
