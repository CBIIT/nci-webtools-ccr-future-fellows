const { difference, isArray, isArrayLike, isEmpty, isEqual } = require('lodash');

// define validator functions (which return true if valid)
const required = e => !['', [], {}, undefined, null].some(v => isEqual(v, e));
const nullable = f => e => !required(e) || f(e);
const array = nullable(e => isArray(e));
const limit = nullable(len => e => isArrayLike(e) && e.length <= len);
const range = nullable((min, max) => e => e >= min && e <= max);
const within = nullable(arr => e => arr.includes(e) || isEmpty(difference(e, arr)));

function validate(obj, validators) {
    const errors = {};
    for (let key in obj) {
        // iterate over validators for each key
        for (let validator of (validators[key] || [])) {
            const isValid = validator(body[key]);
            if (!isValid) errors[key] = true;
        }
    }
    return errors;
}

module.exports = {
    validate, required, nullable, array, limit, range, within
};