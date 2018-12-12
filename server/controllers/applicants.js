const path = require('path');
const fs = require('fs-extra');
const { difference, isArray, isArrayLike, isEmpty, isEqual, mapValues } = require('lodash');
const uuid4 = require('uuid/v4');
const isFuture = require('date-fns/is_future')
const connection = require('../components/connection');
module.exports = { add, get, search, update };

/**
 * Retrieves lookup tables for applicants. These tables are used to
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

async function search({body}) {
    const join = (c, e) => isArray(e) ? e.filter(c).join() : c(e);

    const parameters = {
        job_category: null,
        state: null,
        is_foreign: true,
        education_level: null,
        scientific_focus: null
    }

    const [results] = await connection.execute(`
        call search_applicants(
            :job_category,
            :state,
            :is_foreign,
            :education_level,
            :scientific_focus
        )`, parameters);

    return results[0];
}


function get(query) {

    return {};
}

async function validate({body, files}) {
    console.log(body);
    const errors = {};

    // use ids for lookup values
    const lookup = mapValues(
        await getLookupTables(),
        v => v.map(e => String(e.id))
    );

    // define validator functions (which return true if valid)
    const required = e => !['', [], {}, undefined, null].some(v => isEqual(v, e));

    // validators below are nullable (eg: return true if a value is not provided)
    const nullable = f => e => !required(e) || f(e);
    const pattern = nullable(e => p.test(e));
    const range = nullable((min, max) => e => e >= min && e <= max);
    const inArray = nullable(arr => e => arr.includes(e));
    const intersectsArray = nullable(arr => e => isEmpty(difference(e, arr)));
    const limitLength = nullable(len => e => isArrayLike(e) && e.length <= len);

    const rules = {
        job_category_id: [required, inArray(lookup.job_category)],
        first_name: [required],
        last_name: [required],
        email: [required],
        address_1: [required],
        city: [required],
        state_id: [inArray(lookup.state)],
        home_phone: [required],
        citizenship_id: [required, inArray(lookup.citizenship)],
        undergraduate_gpa: [range(0, 4)],
        research_interests: [required],
        postdoc_experience: [required],
        referral_source: [required],
        availability_date: [required, isFuture],
        education_level: [intersectsArray(lookup.education_level)],
        scientific_focus: [intersectsArray(lookup.scientific_focus), limitLength(5)],
    };

    for (let key in rules) {
        // iterate over validators for each key
        for (let validator of rules[key]) {
            const isValid = validator(body[key]);
            if (!isValid) errors[key] = true;
        }
    }

    if (!files.resume_file)
        errors.resume_file = true;

    return errors;
}

async function add({config, request}) {
    const validationErrors = await validateApplicant(request);
    const { body, files } = request;

    if (!isEmpty(validationErrors))
        return validationErrors;

    // move file to uploads folder
    const filepath = path.join(config.folders.uploads, uuid4() + '.pdf');
    fs.ensureDirSync(config.folders.uploads);
    fs.moveSync(files.resume_file.path, filepath);

    // create parameters for stored procedure
    const join = (c, e) => isArray(e) ? e.filter(c).join() : c(e);
    const parameters = {
        ...body,
        status: 'PENDING',
        is_foreign: body.state === '',
        education_level: join(Number, body.education_level || []),
        scientific_focus: join(Number, body.scientific_focus || []),
        resume_filepath: filepath
    };

    for (let key in parameters) {
        if (parameters[key].length === 0)
            parameters[key] = null;
    }

    await connection.execute(`
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
        )`, parameters);

    return null;
}

/**
 *
 * @param {koa.Request} request
 */
function update(request) {

}


function getUsers() {
    const query = async sql => (await connection.query(sql))[0];
    return query('select * from user_track');
}