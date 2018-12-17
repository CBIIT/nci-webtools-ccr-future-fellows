const path = require('path');
const fs = require('fs-extra');
const { mapValues, isEmpty } = require('lodash');
const uuid4 = require('uuid/v4');
const isFuture = require('date-fns/is_future')
const connection = require('../components/connection');
const { validate, required, array, limit, range, within } = require('../components/validators');
module.exports = { add, get, search, update };

/**
 * Adds an applicant
 * @param {Koa Context} context
 */
async function add(ctx) {
    const validationErrors = await validateAdd(ctx);
    const { body, files } = ctx.request;
    const { config } = ctx;

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
            :state_id,
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
        job_category: join(Number, body.job_category),
        state_id: join(Number, body.state_id),
        is_foreign: body.is_foreign,
        education_level: join(Number, body.education_level),
        scientific_focus: join(Number, body.scientific_focus)
    }

    const [results] = await connection.execute(`
        call search_applicants(
            :job_category,
            :state_id,
            :is_foreign,
            :education_level,
            :scientific_focus
        )`, parameters);

    return results[0];
}


async function get(id) {
   const [results] = await connection.execute(
       `call get_applicant(:applicant_id)`,
       {applicant_id: id}
    );
    return results[0];
}


/**
 *
 * @param {koa.Request} request
 */
async function update(request) {
    const validationErrors = await validateUpdate(ctx);
    const { body } = ctx.request;

    if (!isEmpty(validationErrors))
        return validationErrors;

    // create parameters for stored procedure
    const join = (c, e) => isArray(e) ? e.filter(c).join() : c(e);
    const parameters = {
        ...body,
        education_level: join(Number, body.education_level || []),
        scientific_focus: join(Number, body.scientific_focus || []),
    };

    // set empty parameters to null
    for (let key in parameters) {
        if (parameters[key].length === 0)
            parameters[key] = null;
    }

    await connection.execute(`
        call update_applicant(
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
            :scientific_focus
        )`, parameters);

}


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
        education_level: [array, within(lookup.education_level)],
        scientific_focus: [array, within(lookup.scientific_focus), limit(5)],
        resume_file: [required],
    });
}

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
        ip_address: [required],
        home_phone: [required],
        citizenship_id: [required, within(lookup.citizenship)],
        undergraduate_gpa: [range(0, 4)],
        education_level: [array, within(lookup.education_level)],
        scientific_focus: [array, within(lookup.scientific_focus), limit(5)],
    });
}

