'use strict';
//Modules
const util = require('util');
const _lang = require('lodash/lang');
const JSON5 = require('json5');
const path = require('path');

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Number} || {result:Boolean}} If false returns no value
 */
function is_string(val) {
    let val_is_string = _lang.isString(val);
    if (val_is_string === true) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:*} || {result:Boolean}} If false returns no value
 */
function is_parsed_to_json5(val) {
    let value;
    try {
        value = JSON5.parse(val);
    }
    catch (e) {
        /*Checking value is plain object after parse, because usually value is a json.*/
        if (_lang.isPlainObject(val) === true) return {result: true, value: val};
        return {result: false};
    }
    return {result: true, value};
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Number} || {result:Boolean}} If false returns no value
 */
function is_number(val) {
    if (typeof val === 'number') {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Number} || {result:Boolean}} If false returns no value
 */
function is_integer(val) {
    if (Number.isInteger(val) === true) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

function is_positive_integer(val) {
    if (Number.isInteger(val) === true) {
        if (val > 0) {
            return {result: true, value: val};
        }
    }

    return {result: false};
}

function is_positive_or_zero_integer(val) {
    if (Number.isInteger(val) === true) {
        if (val > -1) {
            return {result: true, value: val};
        }
    }

    return {result: false};
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Number} || {result:Boolean}} If false returns no value
 */
function is_string_or_number(val) {
    let {result: is_string_result, value: is_string_val} = is_string(val);
    if (is_string_result === true) {
        return {result: true, value: is_string_val};
    }
    let {result: is_number_result, value: is_number_val} = is_number(val);
    if (is_number_result === true) {
        return {result: is_number_result, value: is_number_val};
    }
    return {result: false};
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Number} || {result:Boolean}} If false returns no value
 */
function is_string_or_array(val) {
    let {result: is_string_result, value: is_string_val} = is_string(val);
    if (is_string_result === true) {
        return {result: true, value: is_string_val};
    }
    let {result: is_array_result, value: is_array_val} = is_array(val);
    if (is_array_result === true) {
        return {result: is_array_result, value: is_array_val};
    }
    return {result: false};
}

/**
 *
 * @param {*} val
 * @param {String} expected_full_type_str Example of full type: "[object Object]".
 * @return {{result:Boolean,value:*} || {result:Boolean}} If false returns no value
 */
function is_full_type(val, expected_full_type_str) {
    //receiving full type
    let val_type = Object.prototype.toString.call(val);
    if (val_type === expected_full_type_str) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Object} || {result:Boolean}} If false returns no value
 */
function is_object(val) {
    return is_full_type(val, "[object Object]");
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Object} || {result:Boolean}} If false returns no value
 */
function is_object_like(val) {
    if (_lang.isObjectLike(val)) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Object} || {result:Boolean}} If false returns no value
 */
function is_array(val) {
    if (Array.isArray(val)) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Function} || {result:Boolean}} If false returns no value
 */
function is_function(val) {
    if (typeof val === 'function') {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Function} || {result:Boolean}} If false returns no value
 */
function is_regexp(val) {
    if (util.isRegExp(val)) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

const uuid_regex = /[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}/;
/**
 *
 * @param {String} val
 * @return {{result:Boolean,value:*} || {result:Boolean}} If false returns no value
 */
function is_uuid(val) {
    if (uuid_regex.test(val)) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:*} || {result:Boolean}} If false returns no value
 */
function not_undefined(val) {
    if (val !== undefined) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Boolean} || {result:Boolean}} If false returns no value
 */
function is_parsed_to_boolean(val) {
    let stringified_val = String(val).toLowerCase();
    if (stringified_val === 'true') {
        return {result: true, value: true};
    }
    else if (stringified_val === 'false') {
        return {result: true, value: false};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Number} || {result:Boolean}} If false returns no value
 */
function is_parsed_to_numeric(val) {
    //using "parseFloat" JS function to parse both: int and float Numbers
    let parsed_val = parseFloat(val);
    /*Parsing by default will try to find first numbers and will return output with them.
    * Therefore checking input is non-strictly equal to output.*/
    if (parsed_val == val) {
        return {result: true, value: parsed_val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Number|String} || {result:Boolean}} If false returns no value
 */
function is_parsed_to_numeric_or_is_string(val) {
    let {result, value} = is_parsed_to_numeric(val);
    if (result === true) {
        return {result: true, value: value};
    }
    else if (_lang.isString(val) === true) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Integer} || {result:Boolean}} If false returns no value
 */
function is_parsed_to_int(val) {
    //checking value is numeric (float or integer)
    let {result, value: numeric_val} = is_parsed_to_numeric(val);
    if (result === true) {
        if (Number.isInteger(numeric_val) === true) {
            return {result: true, value: numeric_val};
        }
        else {
            return {result: false};
        }
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Integer} || {result:Boolean}} If false returns no value
 */
function is_parsed_to_positive_or_zero_int(val) {
    let {result, value: int_val} = is_parsed_to_int(val);
    if (result === true) {
        if (int_val > -1) {
            return {result: true, value: int_val};
        }
        else {
            return {result: false};
        }
    }
    else {
        return {result};
    }
}

/**
 *
 * @param {*} val
 * @return {{result:Boolean,value:Integer} || {result:Boolean}} If false returns no value
 */
function is_parsed_to_positive_int(val) {
    let {result, value: int_val} = is_parsed_to_int(val);
    if (result === true) {
        if (int_val > 0) {
            return {result: true, value: int_val};
        }
        else {
            return {result: false};
        }
    }
    else {
        return {result};
    }
}

/**
 *
 *
 * @param {*} val
 * @return {{result:Boolean,value:Number} || {result:Boolean}} If false returns no value
 */
function is_parsed_to_float(val) {
    //checking value is float
    let {result, value: numeric_val} = is_parsed_to_numeric(val);
    if (result === true) {
        //if value is not integer and it is numeric, that it is float
        if (Number.isInteger(numeric_val) === false) {
            return {result: true, value: numeric_val};
        }
        else {
            return {result: false};
        }
    }
    else {
        return {result};
    }
}

/**
 *
 *
 * @param {*} val
 * @return {{result:Boolean,value:Number} || {result:Boolean}} If false returns no value
 */
function is_parsed_to_json_valid_type(val) {
    /*undefined will be equal to undefined, therefore checking it at the beginning.*/
    if (val === undefined) return {result: false};

    let stringified_value = JSON.stringify(val);
    let parsed_stringified_value = JSON.parse(stringified_value);
    if (_lang.isEqual(val, parsed_stringified_value) === false) {
        return {result: false};
    }

    return {result: true, value: stringified_value};
}

/**
 *
 * @param {String} val
 * @return {{result:Boolean,value:*} || {result:Boolean}} If false returns no value
 */
function is_absolute_path(val) {
    if (path.isAbsolute(val)) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {String} val
 * @param {RegExp} regexp
 * @return {{result:Boolean,value:*} || {result:Boolean}} If false returns no value
 */
function is_matching_regexp(val, regexp) {
    let is_matching = regexp.test(val);
    if (is_matching === true) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

/**
 *
 * @param {*} val
 * @param {String} property_name
 * @return {{result:Boolean,value:*} || {result:Boolean}} If false returns no value
 */
function has_own_property(val, property_name) {
    let has_own_property = val.hasOwnProperty(property_name);
    if (has_own_property === true) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

function is_result_value_object(val) {
    if (val == null) return {result: false};
    /*Result property should be boolean.*/
    if (typeof val.result !== 'boolean') return {result: false};
    /*If result is true, property "value" should be present.*/
    if (val.result === true && val.hasOwnProperty('value') === false) return {result: false};
    return {result: true, value: val};
}

function lookup_contains_strict_value(lookup, val) {
    let is_found = Object.values(lookup).some((value) => value === val);
    if (is_found === true) {
        return {result: true, value: val};
    }
    else {
        return {result: false};
    }
}

module.exports = {
    is_object,
    is_object_like,
    is_array,
    is_string,
    is_number,
    is_integer,
    is_positive_integer,
    is_positive_or_zero_integer,
    is_function,
    is_regexp,
    is_uuid,

    is_string_or_number,
    is_string_or_array,

    is_result_value_object,

    not_undefined,

    is_parsed_to_boolean,
    is_parsed_to_numeric,
    is_parsed_to_int,
    is_parsed_to_json5,
    is_parsed_to_positive_or_zero_int,
    is_parsed_to_float,
    is_parsed_to_numeric_or_is_string,
    is_parsed_to_positive_int,
    is_parsed_to_json_valid_type,

    is_absolute_path,
    is_matching_regexp,
    has_own_property,
    lookup_contains_strict_value,
};
