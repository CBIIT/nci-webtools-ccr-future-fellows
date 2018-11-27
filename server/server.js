// require environmental variables
require('dotenv').config();
const path = require('path');

const Koa = require('koa');
const body = require('koa-body');
const compose = require('koa-compose');
const cors = require('@koa/cors');
const ejs = require('koa-ejs');
const json = require('koa-json');
const static = require('koa-static');
const routes = require('./routes');
const { PORT, PRODUCTION } = process.env;

const app = new Koa();

// use ejs templates (default layout: templates/layout.html)
ejs(app, {
    root: path.join(__dirname, 'templates'),
    debug: !PRODUCTION,
    cache: PRODUCTION,
    delimiter: ':'
});

const middleware = compose([
    static('public'),
    body(),
    cors(),
    json(),
    ...routes,
]);

app.use(middleware);
app.listen(PORT || 3000);
