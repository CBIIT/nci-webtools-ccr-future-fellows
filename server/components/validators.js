const { difference, isArray, isArrayLike, isEmpty, isEqual } = require('lodash');

// define validator functions (which return true if valid)
const required = e => !['', [], {}, undefined, null].some(v => isEqual(v, e));
const array  =                 e => !required(e) || isArray(e);
const limit  = (maxLength)  => e => !required(e) || (isArrayLike(e) && e.length <= maxLength);
const range  = (min, max)   => e => !required(e) || (e >= min && e <= max);
const within = (values)     => e => !required(e) || values.includes(e) || isEmpty(difference(e, values));

function validate(obj, validators) {
    const errors = {};
    for (let key in obj) {
        // iterate over validators for each key
        for (let validator of (validators[key] || [])) {
            const isValid = validator(obj[key]);
            if (!isValid) errors[key] = true;
        }
    }
    return errors;
}

module.exports = {
    validate, required, array, limit, range, within
};