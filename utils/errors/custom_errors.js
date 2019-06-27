'use strict';
//Local utils
const {get_msg_with_args} = require('../../utils/log/msg_tmpl');
const {stringify_val_for_print} = require('../../utils/node_js/util/inspect');
const {mand_arg_error} = require('./arg_errors');

/**
 *
 * @param main_message
 * @param {Array<Object>|Object} arg_objs Each object my have options: {@link arg_obj_opts}, {@link stringify_val_for_print_opts}
 */
function throw_err_with_args_print(main_message, ...arg_objs) {
    let msg = get_msg_with_args(main_message, ...arg_objs);
    throw new Error(msg);
}

module.exports = {
    throw_err_with_args_print: throw_err_with_args_print,
};

