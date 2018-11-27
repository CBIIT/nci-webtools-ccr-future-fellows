const connection = require('./connection');

module.exports = {
    getLookupTables,
    getApplicants,
    addApplicant,
    updateApplicant,
}

/**
 *
 */
async function getLookupTables() {
    const query = async sql => (await connection.query(sql))[0];
    return {
        citizenship: await query('SELECT lu_citizenship_id AS id, name FROM lu_citizenship'),
        education_level: await query('SELECT lu_education_level_id AS id, name FROM lu_education_level'),
        job_category: await query('SELECT lu_job_category_id AS id, name FROM lu_job_category'),
        scientific_focus: await query('SELECT lu_scientific_focus_id AS id, name FROM lu_scientific_focus'),
        state: await query('SELECT lu_state_id AS id, short_name as name FROM lu_state'),
    };
}

function getApplicants(query) {


}

async function addApplicant(request) {
    const {
        job_category_id,
        status,

        first_name,
        middle_initial,
        last_name,
        email,
        address1,
        address2,
        city,
        state,
        zip,
        home_phone,
        work_phone,
        fax_phone,
        is_foreign,
        citizenship_id,
        undergraduate_gpa,
        research_interests,
        postdoc_experience,
        referral_source,
        availability_date,
        resume_filepath
    } = request.body;

    connection.execute()

}

/**
 *
 * @param {koa.Request} request
 */
function updateApplicant(request) {

}
