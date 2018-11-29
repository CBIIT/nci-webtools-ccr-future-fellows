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

function validateApplicant({body, files}) {
    return {}
}

async function addApplicant(request) {
    const validationErrors = validateApplicant();
    if (Object.keys(validationErrors).length)
        return validationErrors;

    const { body, files } = request;

    const parameters = {
        ...body,
        status: 'PENDING',
        is_foreign: false,
        education_level: '1,2',
        scientific_focus: '1,2',
        availability_date: '2000-01-01',
        resume_filepath: 'temp/path'
    };

    for (let key in parameters) {
        if (parameters[key] === '')
            parameters[key] = null;
    }

    const result = await connection.execute(`
        call add_applicant(
            :job_category_id,
            :status,
            :first_name,
            :middle_initial,
            :last_name,
            :email,
            :address_1,
            :address_2,
            :city,
            :state,
            :zip,
            :home_phone,
            :work_phone,
            :fax_phone,
            :is_foreign,
            :citizenship_id,
            :undergraduate_gpa,
            :research_interests,
            :postdoc_experience,
            :referral_source,
            :availability_date,
            :resume_filepath,
            :education_level,
            :scientific_focus            
        )`, parameters)
    return validationErrors;
}

/**
 *
 * @param {koa.Request} request
 */
function updateApplicant(request) {

}
