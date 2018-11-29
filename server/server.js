// require environmental variables
require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');

const Koa = require('koa');
const ejs = require('koa-ejs');
const static = require('koa-static');
const routes = require('./routes');
const { getLookupTables } = require('./controllers');
const { PORT, PRODUCTION, UPLOADS_FOLDER } = process.env;

const app = new Koa();

// async/await
(async app => {
    // ensure uploads folder exists
    let uploadsFolder = UPLOADS_FOLDER || 'uploads'
    await fs.ensureDir(uploadsFolder)

    // use ejs templates (default layout: views/layout.html)
    ejs(app, {
        root: path.join(__dirname, 'views'),
        // debug: !PRODUCTION, // turn off debug mode in production
        cache: PRODUCTION,  // turn on cache in production
    });

    // assign variables to context
    app.context.lookupTables = await getLookupTables();
    app.context.uploadsFolder = uploadsFolder;

    // use middleware
    app.use(static('public'));
    app.use(routes);
    app.listen(PORT || 3000);
})(app);
