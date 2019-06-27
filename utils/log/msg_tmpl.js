'use strict';
//Modules
const _lang = require('lodash/lang');
//Local utils
const {stringify_val_for_print} = require('../../utils/node_js/util/inspect');
//nt Not using created utils for type checks, option merging and others to avoid problems with recursion of dependencies
/**
 * @typedef {Object} arg_obj_opts
 * @property {function(string): string} get_arg_name_text
 * @property {Boolean} val_from_new_line
 * @property {Boolean} no_val_formatting
 */
let get_arg_obj_opts = (input_opts) => {
    if (input_opts == null) input_opts = {};
    let {
        get_arg_name_text = (arg_name) => `"${arg_name}"`,
        val_from_new_line = true,
        no_val_formatting = false,
    } = input_opts;

    return {
        get_arg_name_text,
        val_from_new_line,
        no_val_formatting,
    };
};

const val_prop_name = 'value';
const name_prop_name = 'name';
let get_arg_str = (arg_obj) => {
    let arg_name = arg_obj[name_prop_name];
    if (arg_obj.hasOwnProperty(val_prop_name) === false) {
        throw new Error(`Argument object does not contain property "${val_prop_name}". Expected otherwise.`);
    }

    if (_lang.isString(arg_name) !== true) {
        if (arg_obj.hasOwnProperty(name_prop_name) === false) {
            throw new Error(`Argument object does not contain property "${name_prop_name}". Expected otherwise.`);
        }
        else {
            throw new Error(`Argument object property "${name_prop_name}" is not a String. Expected string only.
"name_prop_name":
${stringify_val_for_print(arg_name)}.`);
        }
    }

    let {
        get_arg_name_text,
        val_from_new_line,
        no_val_formatting,
    } = get_arg_obj_opts(arg_obj);

    if (typeof get_arg_name_text !== 'function') throw new Error(`"get_arg_name_text" argument is not a Function. Expected function only.
"get_arg_name_text":
${stringify_val_for_print(get_arg_name_text)}.`);
    if (typeof val_from_new_line !== 'boolean') throw new Error(`"val_from_new_line" argument is not a Boolean. Expected boolean only.
"val_from_new_line":
${stringify_val_for_print(val_from_new_line)}.`);

    let arg_name_text = get_arg_name_text(arg_name);
    if (_lang.isString(arg_name_text) !== true) throw new Error(`"arg_name_text" argument is not a String. Expected string only.
"arg_name_text":
${stringify_val_for_print(arg_name_text)}.`);

    let arg_val = arg_obj[val_prop_name];

    let arg_val_for_print = (!no_val_formatting) ? stringify_val_for_print(arg_val, arg_obj) : arg_val;

    if (val_from_new_line === true) {
        return `${arg_name_text}:\n${arg_val_for_print}.`;
    }
    else {
        return `${arg_name_text}: ${arg_val_for_print}.`;
    }
};

/**
 *
 * @param {Array<Object>|Object} arg_objs Each object my have options: {@link arg_obj_opts}, {@link stringify_val_for_print_opts}
 */
function get_args_str(arg_objs) {
    let arg_objs_str = '';
    for (let arg_obj of arg_objs) {
        arg_objs_str += `\n${get_arg_str(arg_obj)}`;
    }

    return arg_objs_str;
}

/**
 *
 * @param main_message
 * @param {Array<Object>|Object} arg_objs Each object my have options: {@link arg_obj_opts}, {@link stringify_val_for_print_opts}
 */
function get_msg_with_args(main_message, ...arg_objs) {
    if (_lang.isString(main_message) !== true) throw new Error(`"main_message" argument is not a String. Expected string only.
"main_message":
${stringify_val_for_print(main_message)}.`);

    return `${main_message}${get_args_str(arg_objs)}`;
}
function get_one_line_msg_with_args(main_message, ...arg_objs) {
    if (_lang.isString(main_message) !== true) throw new Error(`"main_message" argument is not a String. Expected string only.
"main_message":
${stringify_val_for_print(main_message)}.`);

    let arg_objs_str = '';
    for (let arg_obj of arg_objs) {
        arg_obj.val_from_new_line = false;
        arg_objs_str += `${get_arg_str(arg_obj)}`;
    }
    return `${main_message}.${arg_objs_str}`;
}

module.exports = {
    get_arg_str: get_arg_str,
    get_args_str: get_args_str,

    get_msg_with_args: get_msg_with_args,
    get_one_line_msg_with_args: get_one_line_msg_with_args,
};

