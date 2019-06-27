'use strict';
/**
 *
 * @param {Array} array
 * @returns {Array}
 */
function get_duplicates(array) {
    let checked = new Set;
    let result = [];
    let first_dimension_idx = array.length;
    while (!!first_dimension_idx-- === true) {
        let item = array[first_dimension_idx];
        if (checked.has(item) === false) {
            checked.add(item);
        }
        else {
            result.push(item);
        }
    }
    return result;
}

/**
 *
 * @param {Array} array
 * @returns {Boolean}
 */
function has_duplicates(array) {
    if (new Set(array).size === array.length) {
        return false;
    }
    else {
        return true;
    }
}

function remove_duplicates(array) {
    let seen = {};
    let ret_arr = [];
    for (let i = 0; i < array.length; i++) {
        if (!seen.hasOwnProperty(array[i])) {
            ret_arr.push(array[i]);
            seen[array[i]] = true;
        }
    }
    return ret_arr;
}

module.exports = {
    get_duplicates: get_duplicates,
    has_duplicates: has_duplicates,
    remove_duplicates: remove_duplicates,
};
