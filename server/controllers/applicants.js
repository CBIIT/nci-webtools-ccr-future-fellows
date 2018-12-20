const path = require('path');
const fs = require('fs-extra');
const { mapValues, isEmpty, isArray } = require('lodash');
const uuid4 = require('uuid/v4');
const isFuture = require('date-fns/is_future')
const connection = require('../components/connection');
const { validate, required, array, limit, range, within } = require('../components/validators');
module.exports = { add, get, search, update, approve, remove };

/**
 * Adds an applicant
 * @param {Koa Context} context
 */
async function add(ctx) {
    const validationErrors = await validateAdd(ctx);
    if (!isEmpty(validationErrors))
        return validationErrors;

    const { body, files } = ctx.request;
    const { folders } = ctx.config;
    const filepath = path.join(folders.uploads, uuid4() + '.pdf');

    // move resume to uploads folder
    fs.ensureDirSync(folders.uploads);
    fs.moveSync(files.resume_file.path, filepath);

    await connection.execute(
        `call add_applicant(
            :job_category_id,
            :status,
            :first_name,
            :middle_initial,
            :last_name,
            :email,
            :address_1,
            :address_2,
            :city,
            :state_id,
            :zip,
            :is_foreign,
            :home_phone,
            :work_phone,
            :fax_phone,
            :citizenship_id,
            :undergraduate_gpa,
            :research_interests,
            :postdoc_experience,
            :referral_source,
            :availability_date,
            :resume_file,
            :ip_address,
            :education_level,
            :scientific_focus)`,
            mapEmptyToNull({
                ...body,
                status: ctx.session.authenticated ? body.status : 'pending',
                is_foreign: false,
                education_level: filterJoin(Number, body.education_level || []),
                scientific_focus: filterJoin(Number, body.scientific_focus || []),
                resume_file: filepath,
                ip_address: ctx.ip
            })
    );

    return null;
}


/**
 * Retrieves an applicant given their id
 * @param {Koa.Context} ctx
 * @return {object} Applicant information
 */
async function get(id) {
    const [applicant] = (await connection.execute(
        `call get_applicant(:id)`,
        {id: id}
    ))[0][0];

    return {
        ...applicant,
        scientific_focus: (applicant.scientific_focus_id || '').split(','),
        education_level: (applicant.education_level_id || '').split(','),
    };
}


/**
 * Approves an applicant (ie: sets their status to "approved")
 * @param {Koa.Context} ctx
 */
async function approve(id) {
    await connection.execute(
        `update applicant set status = 'approved' where applicant_id = :id`,
        {id: id}
     );
     return true;
}


/**
 * Approves an applicant (ie: sets their status to "approved")
 * @param {Koa.Context} ctx
 */
async function remove(id) {
    await connection.execute(
        `update applicant set status = 'removed' where applicant_id = :id`,
        {id: id}
    );
    return true;
}


/**
 * Retrieves a list of applicants given search criteria
 * If no criteria are provided, returns all applicants
 * @param {Koa.Context} ctx
 */
async function search(ctx) {
    const body = ctx.body || {};
    console.log(body);
    const [results] = await connection.execute(
        `call search_applicants(
            :job_category,
            :state_id,
            :is_foreign,
            :education_level,
            :scientific_focus)`,
        mapEmptyToNull({
            job_category: filterJoin(Number, body.job_category_id || []),
            state_id: filterJoin(Number, body.state_id || []),
            is_foreign: body.is_foreign === 'true', // all form values are strings
            education_level: filterJoin(Number, body.education_level || []),
            scientific_focus: filterJoin(Number, body.scientific_focus || [])
        })
    );
    return results[0];
}


/**
 * Updates an applicant
 * @param {Koa.Context} ctx
 * @return {object | null}
 */
async function update(ctx) {
    const validationErrors = await validateUpdate(ctx);
    if (!isEmpty(validationErrors))
        return validationErrors;

    const { body } = ctx.request;
    await connection.execute(
        `call update_applicant(
            :applicant_id,
            :job_category_id,
            :status,
            :first_name,
            :middle_initial,
            :last_name,
            :email,
            :address_1,
            :address_2,
            :city,
            :state_id,
            :zip,
            :is_foreign,
            :home_phone,
            :work_phone,
            :fax_phone,
            :citizenship_id,
            :undergraduate_gpa,
            :education_level,
            :scientific_focus)`,
            mapEmptyToNull({
                ...body,
                applicant_id: ctx.params.id,
                is_foreign: false,
                education_level: filterJoin(Number, body.education_level || []),
                scientific_focus: filterJoin(Number, body.scientific_focus || []),
            })
    );
    return null;
}


/**
 * Validates parameters for adding applicants
 * @param {Koa.Context} ctx
 * @return {object} An object containing validation errors for the body
 */
async function validateAdd(ctx) {
    const { body, files } = ctx.request;
    const { lookupTables } = ctx;

    // use ids for lookup values
    const lookup = mapValues(lookupTables, v =>
        v.map(e => String(e.id))
    );

    return validate({...body, ...files}, {
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
        education_level: [within(lookup.education_level)],
        scientific_focus: [within(lookup.scientific_focus), limit(5)],
        resume_file: [required],
    });
}


/**
 * Validates parameters for updating applicants
 * @param {Koa.Context} ctx
 * @return {object} An object containing validation errors for the body
 */
async function validateUpdate(ctx) {
    const { body } = ctx.request;
    const { lookupTables } = ctx;

    // use ids for lookup values
    const lookup = mapValues(lookupTables, v =>
        v.map(e => String(e.id))
    );

    return validate(body, {
        job_category_id: [required, within(lookup.job_category)],
        first_name: [required],
        last_name: [required],
        email: [required],
        address_1: [required],
        city: [required],
        state_id: [within(lookup.state)],
        home_phone: [required],
        citizenship_id: [required, within(lookup.citizenship)],
        undergraduate_gpa: [range(0, 4)],
        education_level: [within(lookup.education_level)],
        scientific_focus: [within(lookup.scientific_focus), limit(5)],
    });
}


/**
 * Filters an array, and then joins the results
 * @example filterJoin(Number, [1, 'a', 2, 'b', '3'])
 * @param {function} filterFn
 * @param {array} array
 */
function filterJoin(filterFn, array) {
    return isArray(array)
        ? array.filter(filterFn).join()
        : filterFn(array)
}


/**
 * Maps empty object values (eg: empty strings or arrays) to null
 * @param {object} obj The object to map
 * @return {object} A reference to the updated object
 */
function mapEmptyToNull(obj) {
    for (let key in obj) {
        if (obj[key].length === 0)
            obj[key] = null;
    }
    return obj;
}
