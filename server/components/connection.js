const mysql = require('mysql2');
const { database } = require('../../config.json');

module.exports = mysql.createPool({
    host: database.host,
    user: database.user,
    password: database.password,
    database: database.name,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 300,
}).promise();