'use strict';
//Local utils
const {stringify_val_for_print} = require('../../utils/node_js/util/inspect');

function mand_arg_error(arg_name) {
    let arg_name_present;
    if (arg_name != null) {
        if (typeof arg_name !== 'string') {
            throw Error(`Argument "arg_name" is not a string. Expected otherwise.
"arg_name":\n${stringify_val_for_print(arg_name)}`);
        }
        arg_name_present = true;
    }
    else {
        arg_name_present = false;
    }
    throw new Error(`Mandatory argument${(arg_name_present) ? ` "${arg_name}"` : ''} is missed. Please add argument.`);
}

module.exports = {
    mand_arg_error: mand_arg_error,
};