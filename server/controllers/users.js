const connection = require('../components/connection');
module.exports = { list };

async function list() {
    const query = async sql => (await connection.query(sql))[0];
    return await query('select * from user_track');
}