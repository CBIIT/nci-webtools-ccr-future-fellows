const path = require('path');
const koa = require('koa');
const ejs = require('koa-ejs');
const static = require('koa-static');
const session = require('koa-session');
const routes = require('./routes');
const config = require('../config.json');
const { getLookupTables } = require('./controllers/applicants');

(async function() {
    const app = new koa();

    app.keys = config.keys;
    app.context.config = config;
    app.context.lookupTables = await getLookupTables();

    app.use(static('public'));
    app.use(session(app));
    app.use(routes);

    // use ejs templates (default layout: views/layout.html)
    ejs(app, {
        root: path.join(__dirname, 'views'),
        debug: !config.production, // turn on debug mode during development
        cache: config.production,  // turn on cache in production
    });

    app.listen(config.port || 3000);
})();
