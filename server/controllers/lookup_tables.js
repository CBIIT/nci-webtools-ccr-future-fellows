const connection = require('../components/connection');

/**
 * Retrieves lookup tables for applicants.
 */
async function get() {
    const query = async sql => (await connection.query(sql))[0];
    return {
        citizenship: await query('SELECT lu_citizenship_id AS id, name FROM lu_citizenship'),
        education_level: await query('SELECT lu_education_level_id AS id, name FROM lu_education_level'),
        job_category: await query('SELECT lu_job_category_id AS id, name FROM lu_job_category'),
        scientific_focus: await query('SELECT lu_scientific_focus_id AS id, name FROM lu_scientific_focus'),
        state: await query('SELECT lu_state_id AS id, name FROM lu_state'),
    };
}