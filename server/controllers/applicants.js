const path = require('path');
const fs = require('fs-extra');
const zip = require('jszip');
const uuid4 = require('uuid/v4');
const isFuture = require('date-fns/is_future')
const { mapValues, isEmpty } = require('lodash');
const { validate, required, limit, range, within } = require('../components/validators');
const connection = require('../components/connection');
const pdf = require('../components/pdf');
module.exports = { add, get, search, update, approve, remove, generateExport };

/**
 * Adds an applicant
 * @param {Koa Context} context
 */
async function add(ctx) {
    const errors = validateAdd(ctx);
    if (!isEmpty(errors)) return errors;

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
                education_level: filterJoin(Number, body.education_level || []),
                scientific_focus: filterJoin(Number, body.scientific_focus || []),
                is_foreign: body.is_foreign === 'true', // all form values are strings
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
        scientific_focus: (applicant.scientific_focus_id || '').split(',').filter(String),
        education_level: (applicant.education_level_id || '').split(',').filter(String),
        scientific_focus_names: (applicant.scientific_focus || '').split(',').filter(String),
        education_level_names: (applicant.education_level || '').split(',').filter(String),
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
    const errors = validateUpdate(ctx);
    if (!isEmpty(errors)) return errors;

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
                education_level: filterJoin(Number, body.education_level || []),
                scientific_focus: filterJoin(Number, body.scientific_focus || []),
                is_foreign: body.is_foreign === 'true', // all form values are strings
            })
    );
    return null;
}


async function generateExport(ctx) {
    const applicant = await get(ctx.params.id);
    const archive = new zip();

    // add resume to archive
    archive.file(
        `${applicant.last_name}_${applicant.first_name}_Resume.pdf`,
        fs.readFileSync(applicant.resume_file)
    );

    // add applicant info to archive
    archive.file(
        `${applicant.last_name}_${applicant.first_name}_Application.pdf`,
        pdf({
            content: [
                {
                    text: `${applicant.last_name}, ${applicant.first_name}\n\n`.toUpperCase(),
                    style: 'header',
                },
                {
                    text: 'Application Details\n\n',
                    style: 'subheader'
                },
                {
                    text: [
                        {text: 'Application Date: ', style: 'bold'},
                        applicant.created_date.toLocaleString()
                    ],
                },

                {
                    text: [
                        {text: 'Email Address: ', style: 'bold'},
                        applicant.email,
                    ],
                },

                {
                    text: [
                        {text: 'Job Category: ', style: 'bold'},
                        applicant.job_category,
                    ],
                },

                {
                    text: [
                        {text: 'Citizenship: ', style: 'bold'},
                        applicant.citizenship,
                    ],
                },

                {
                    text: [
                        {text: 'Address: ', style: 'bold'},
                        [applicant.address_1, applicant.address_2].join('\n'),
                    ],
                },

                {
                    text: [
                        {text: 'City: ', style: 'bold'},
                        applicant.city
                    ],
                },

                {
                    text: [
                        {text: 'State: ', style: 'bold'},
                        applicant.state || 'Not Provided'
                    ],
                },

                {
                    text: [
                        {text: 'Zip: ', style: 'bold'},
                        applicant.zip || 'Not Provided'
                    ],
                },

                {
                    text: [
                        {text: 'Home Phone: ', style: 'bold'},
                        applicant.home_phone || 'Not Provided'
                    ],
                },

                {
                    text: [
                        {text: 'Work Phone: ', style: 'bold'},
                        applicant.work_phone || 'Not Provided'
                    ],
                },

                {
                    text: [
                        {text: 'Fax Phone: ', style: 'bold'},
                        applicant.fax_phone || 'Not Provided'
                    ],
                },

                {
                    text: [
                        {text: 'GPA: ', style: 'bold'},
                        applicant.undergraduate_gpa || 'Not Provided'
                    ],
                },

                {text: 'Scientific Focus Areas: ', style: 'bold'},
                {
                    ul: isEmpty(applicant.scientific_focus_names)
                        ? ['Not Provided']
                        : applicant.scientific_focus_names
                },

                {text: 'Degrees: ', style: 'bold'},
                {
                    ul: isEmpty(applicant.education_level_names)
                        ? ['Not Provided']
                        : applicant.education_level_names
                },

                {text: '\n\nQuestions and Answers\n', style: 'subheader'},

                {text: '\n1. Please give a brief statement of your research interests and reason for seeking a postdoctoral fellowship at the NCI', style: 'bold'},
                {text: applicant.research_interests},

                {text: '\n2. Please provide a brief overview of your postdoctoral experience if any. List title of positions held and length of time employed.', style: 'bold'},
                {text: applicant.postdoc_experience},

                {text: '\n3. Please tell us how you heard about this opportunity (name of school, title of event or conference, advertisement/journal, etc.).', style: 'bold'},
                {text: applicant.referral_source},

                {text: '\n4. Please let us know your date of availability', style: 'bold'},
                {text: applicant.availability_date.toLocaleString()},

            ],
            defaultStyle: {
                font: 'SourceSansPro'
            },
            styles: {
                header: {
                    fontSize: 16,
                    bold: true,
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                },
                bold: {
                    bold: true,
                }
            }
        })
    );

    // return zip contents as buffer
    return await archive.generateAsync({type: 'nodebuffer'});
}


/**
 * Validates parameters for adding applicants
 * @param {Koa.Context} ctx
 * @return {object} An object containing validation errors for the body
 */
function validateAdd(ctx) {
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
function validateUpdate(ctx) {
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
function filterJoin(filterFn, values) {
    return Array.isArray(values)
        ? values.filter(filterFn).join()
        : filterFn(values)
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
