const connection = require('../components/connection');

const ACTIONS = {
    LOGGED_IN: 'Logged In',
    VIEWED_DETAILS: 'Viewed Details',
    VIEWED_RESUME: 'Viewed Resume',
    DOWNLOADED_FILES: 'Downloaded Files',
    EMAILED_FILES: 'Emailed Files',
    REMOVED_APPLICANT: 'Removed Applicant',
    APPROVED_APPLICANT: 'Approved Applicant',
    SEARCHED_APPLICANTS: 'Searched Applicants'
}

async function list(user, date) {
    const query = async sql => (await connection.query(sql))[0];
    return await query(
        `select username, first_name, last_name, count(*) as logons from user_track
            where action = 'Logged In'
            group by username, first_name, last_name`
    );
}


async function getActions(username) {
    const query = async (sql, params) => (await connection.query(sql, params))[0];
    return await query(
        `select action, target, created_date as date from user_track
            where username = :username
            order by date desc`,
        {username}
    );
}


async function trackAction(user, action, target) {
    return await connection.execute(
        `insert into user_track (
            username,
            first_name,
            last_name,
            action,
            target
        ) values (
            :username,
            :first_name,
            :last_name,
            :action,
            :target
        )`,
        {
            ...user,
            action,
            target: target || null
        }
    )
}

module.exports = { ACTIONS, list, trackAction, getActions };
