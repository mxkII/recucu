'use strict';
//Modules
const _lang = require('lodash/lang');
//Local utils
const {get_var_name} = require('../../utils/errors/error_info');
const {stringify_val_for_print} = require('../../utils/node_js/util/inspect');
const {mand_arg_error} = require('../../utils/errors/arg_errors');
const type_checks = require('../../utils/checks/type_checks');

function not_null_or_undefined_mand(val, arg_name = mand_arg_error()) {
    if (val == null) {
        throw new Error(`"${arg_name}" argument is "${val}". Expected not null or undefined.`);
    }

    return val;
}

function not_undefined_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.not_undefined(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is "${val}". Expected not undefined.`);
    }
}

function is_undefined(val, arg_name = mand_arg_error()) {
    if (val === undefined) {
        return val;
    }
    else {
        throw new Error(`"${arg_name}" argument is not undefined. Expected undefined.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_boolean_mand(val, arg_name = mand_arg_error()) {
    if (typeof val !== 'boolean') {
        throw new Error(`"${arg_name}" argument is not a Boolean. Expected boolean only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }

    return val;
}

function is_string_mand(val, arg_name = mand_arg_error()) {
    if (_lang.isString(val) === false) {
        throw new Error(`"${arg_name}" argument is not a String. Expected string only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }

    return val;
}

function is_object_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_object(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not a plain Object. Expected plain Object.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_object_like_mand(val, arg_name = mand_arg_error()) {
    if (typeof val !== 'object') {
        throw new Error(`"${arg_name}" argument is not an Object. Expected object only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }

    return val;
}

function is_string_or_number_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_string_or_number(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not a String, Number. Expected String, Number only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_string_or_array_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_string_or_array(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not a String, Array. Expected String, Array only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_function_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_function(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not a Function. Expected Function.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_number_mand(val, arg_name = mand_arg_error()) {
    if (_lang.isNumber(val) === false) {
        throw new Error(`"${arg_name}" argument is not a Number. Expected number only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }

    return val;
}

function is_integer_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_integer(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not Integer. Expected otherwise.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_positive_int(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_positive_integer(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not a positive Integer. Expected otherwise.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_positive_or_zero_int(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_positive_or_zero_integer(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not a positive or zero Integer. Expected otherwise.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_array_mand(val, arg_name = mand_arg_error()) {
    if (Array.isArray(val) === false) {
        throw new Error(`"${arg_name}" argument is not an Array. Expected array only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }

    return val;
}

function is_url_strict_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_url_strict(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not a strict URL. Expected otherwise.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_uuid_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_uuid(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not a UUID Expected otherwise.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_result_value_object_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_result_value_object(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not an object with properties: result - mandatory, value - mandatory, if result is true. Expected otherwise.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_parsed_to_boolean_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_parsed_to_boolean(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not a Boolean or String parsable to Boolean. Expected Boolean or String parsable to Boolean only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_parsed_to_numeric_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_parsed_to_numeric(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not a Number or String parsable to Number. Expected Number or String parsable to Number only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_parsed_to_int_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_parsed_to_int(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not an Integer or String parsable to Integer. Expected Number or String parsable to Integer only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_parsed_to_positive_or_zero_int_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_parsed_to_positive_or_zero_int(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not positive or zero Integer or String parsable to such an Integer. Expected Number or String parsable to positive or zero Integer only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_parsed_to_positive_int_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_parsed_to_positive_int(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not positive or zero Integer or String parsable to such an Integer. Expected Number or String parsable to positive or zero Integer only.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_parsed_to_json_valid_type_mand(val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_parsed_to_json_valid_type(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not valid JSON data type. Expected only valid JSON data types.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_absolute_path_mand(val, arg_name = mand_arg_error()){
    let {result, value} = type_checks.is_absolute_path(val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is not absolute path. Expected on;y absolute path.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function is_matching_regexp_mand(val, regexp, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.is_matching_regexp(val, regexp);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument does not match "${get_var_name({regexp})}":"${regexp}". Expected argument matching "${get_var_name({regexp})}":"${regexp}".
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function has_own_property_mand(val, property_name, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.has_own_property(val, property_name);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument does not match "${get_var_name({property_name})}":"${property_name}". Expected argument has "${get_var_name({property_name})}":"${property_name}".
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}

function lookup_contains_strict_value_mand(lookup, val, arg_name = mand_arg_error()) {
    let {result, value} = type_checks.lookup_contains_strict_value(lookup, val);
    if (result === true) {
        return value;
    }
    else {
        throw new Error(`"${arg_name}" argument is absent in lookup.
Argument "${arg_name}" has value:
${stringify_val_for_print(val)}.`);
    }
}
//lookup_contains_strict_value

module.exports = {
    not_null_or_undefined_mand,
    not_undefined_mand,

    is_boolean_mand,
    is_string_mand,
    is_number_mand,
    is_integer_mand,
    is_positive_int,
    is_positive_or_zero_int,
    is_array_mand,
    is_function_mand,
    is_undefined,
    is_url_strict_mand,
    is_uuid_mand,

    is_object_mand,
    is_object_like_mand,
    is_result_value_object_mand,

    is_string_or_number_mand,
    is_string_or_array_mand,

    is_parsed_to_boolean_mand,
    is_parsed_to_numeric_mand,
    is_parsed_to_int_mand,
    is_parsed_to_positive_or_zero_int_mand,
    is_parsed_to_positive_int_mand,
    is_parsed_to_json_valid_type_mand,

    is_absolute_path_mand,
    is_matching_regexp_mand,
    has_own_property_mand,
    lookup_contains_strict_value_mand,
};