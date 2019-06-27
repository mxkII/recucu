'use strict';

/**
 * Pass object with variable to get its name.
 * @example
 * let primitive = 42;
 * let primitive_name = get_var_name({primitive});
 * @param {Object} variable
 * @return {*}
 */
function get_var_name(variable) {
    return Object.keys(variable)[0];
}

module.exports = {
    get_var_name: get_var_name,
};
