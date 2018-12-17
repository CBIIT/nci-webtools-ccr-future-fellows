const connection = require('../components/connection');
module.exports = { get };

async function get() {
    const query = async sql => (await connection.query(sql))[0];
    return await query('select * from user_track');
}