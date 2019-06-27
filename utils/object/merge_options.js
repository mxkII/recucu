/**
 *
 * @param {Object} input_opts
 * @param {Function} opts_destruction
 * @return {Object}
 */
function merge_opts_by_func(input_opts, opts_destruction) {
    /*
     * Fixing case when trying to deconstruct null or undefined and getting error instead */
    if (input_opts == null)
        input_opts = {};

    return opts_destruction(input_opts);
}

module.exports = {
    merge_opts_by_func: merge_opts_by_func,
};
