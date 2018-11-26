// require environmental variables
require('dotenv').config();
const Koa = require('koa');
const body = require('koa-body');
const compose = require('koa-compose');
const { get, post } = require('koa-route');
const static = require('koa-static');
const connection = require('./connection');
const { PORT } = process.env;


const app = new Koa();
const middleware = compose([
    static('public'),
    body(),
    get('/applicants', ctx => {
        const body = JSON.stringify(ctx.request.body);
        ctx.body = `Request body: ${body}`;
    }),
    post('/applicants', ctx => {
        const body = JSON.stringify(ctx.request.body);
        ctx.body = `Request body: ${body}`;
    }),
    put('/applicants', ctx => {
        const body = JSON.stringify(ctx.request.body);
        ctx.body = `Request body: ${body}`;
    }),
]);

app.use(middleware);
app.listen(PORT || 3000);
