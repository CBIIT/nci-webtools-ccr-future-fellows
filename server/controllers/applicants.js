const path = require('path');
const fs = require('fs-extra');
const { difference, isArray, isArrayLike, isEmpty, isEqual, mapValues } = require('lodash');
const uuid4 = require('uuid/v4');
const isFuture = require('date-fns/is_future')
const connection = require('../components/connection');
module.exports = { add, get, search, update };


/**
 * Adds an applicant
 * @param {Koa Context} context
 */
async function add(ctx) {
    const validationErrors = await validateApplicant(ctx);
    const { body, files } = ctx.request;

    if (!isEmpty(validationErrors))
        return validationErrors;

    // move resume to uploads folder
    const filepath = path.join(config.folders.uploads, uuid4() + '.pdf');
    fs.ensureDirSync(config.folders.uploads);
    fs.moveSync(files.resume_file.path, filepath);

    // create parameters for stored procedure
    const join = (c, e) => isArray(e) ? e.filter(c).join() : c(e);
    const parameters = {
        ...body,
        status: ctx.session.authenticated ? body.status : 'PENDING',
        education_level: join(Number, body.education_level || []),
        scientific_focus: join(Number, body.scientific_focus || []),
        resume_filepath: filepath,
        ip_address: ctx.ip
    };

    // set empty parameters to null
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
            :is_foreign,
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
            :ip_address,
            :education_level,
            :scientific_focus
        )`, parameters);
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

async function validate(ctx) {
    const { body, files } = ctx.request;
    const { lookupTables } = ctx;
    const errors = {};

    // use ids for lookup values
    const lookup = mapValues(lookupTables, v =>
        v.map(e => String(e.id))
    );

    // define validator functions (which return true if valid)
    const required = e => !['', [], {}, undefined, null].some(v => isEqual(v, e));

    // validators below are nullable (eg: return true if a value is not provided)
    const nullable = f => e => !required(e) || f(e);
    const array = nullable(e => isArray(e));
    const limit = nullable(len => e => isArrayLike(e) && e.length <= len);
    const range = nullable((min, max) => e => e >= min && e <= max);
    const within = nullable(arr => e => arr.includes(e) || isEmpty(difference(e, arr)));

    const rules = {
        job_category_id: [required, within(lookup.job_category)],
        first_name: [required],
        last_name: [required],
        email: [required],
        address_1: [required],
        city: [required],
        state_id: [within(lookup.state)],
        ip_address: [required],
        home_phone: [required],
        citizenship_id: [required, within(lookup.citizenship)],
        undergraduate_gpa: [range(0, 4)],
        research_interests: [required],
        postdoc_experience: [required],
        referral_source: [required],
        availability_date: [required, isFuture],
        education_level: [array, within(lookup.education_level)],
        scientific_focus: [array, within(lookup.scientific_focus), limit(5)],
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