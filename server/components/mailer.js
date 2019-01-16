const { createTransport } = require('nodemailer');
const { email } = require('../../config.json');

module.exports = createTransport(email);