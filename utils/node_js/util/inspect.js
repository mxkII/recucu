'use strict';
//Modules
let util = require('util');
let os = require('os');
//Local utils
const {join_arr} = require('../../collections/array/concat_data_in_array');
const {merge_opts_by_func} = require('../../../utils/object/merge_options');
const {map_explore_deep} = require('../../../utils/object/map_explore_deep');

/*Do not need to cover in regex "Map inside Map" and similar cases.
* Reason: For example, Map inside Map goes from new line.*/
const line_to_shorten_regex = /^([ ]*(?:\[ )?)(?:Map|Set|WeakMap|WeakSet) {/;
const indent_regex = /^ */;
const _get_need_to_exclude_opts = Symbol('_get_need_to_exclude_opts');
const _merge_need_to_exclude_opts = Symbol('_merge_need_to_exclude_opts');
const _need_to_exclude = Symbol('_need_to_exclude');
class Node_inspect_mgmt {
    #inner_indent_length = 0;
    #expected_indent = '';
    #lines_need_shorten_check = false;
    #current_coll_lines = 0;

    #previous_excluded_lines_indent = '';
    #previous_excluded_lines_amount = 0;
    #is_after_shorten_check_line = false;

    constructor() {
    }

    [_get_need_to_exclude_opts]({
                                    non_arr_coll_max_lines = 2,
                                }) {
        /*Cannot add type_mand_checks here cause it depends on stringify utility.
        * As a result this leads to recursion in "require".*/
        if (Number.isInteger(non_arr_coll_max_lines) === false) {
            throw new Error(`"non_arr_coll_max_lines" argument is not Integer. Expected otherwise.
Argument "non_arr_coll_max_lines" has value:
${util.inspect(non_arr_coll_max_lines)}.`);
        }

        return {
            non_arr_coll_max_lines,
        };
    }
    [_merge_need_to_exclude_opts](options) {
        return merge_opts_by_func(options, this[_get_need_to_exclude_opts].bind(this));
    }

    [_need_to_exclude](line, options) {
        let merged_opts = this[_merge_need_to_exclude_opts](options);
        let {
            non_arr_coll_max_lines,
        } = merged_opts;

        if (this.#lines_need_shorten_check === true) {
            let actual_indent = line.slice(0, this.#inner_indent_length);
            if (actual_indent === this.#expected_indent) {
                if (this.#current_coll_lines >= non_arr_coll_max_lines) {
                    this.#current_coll_lines++;

                    this.#previous_excluded_lines_indent = actual_indent;
                    this.#previous_excluded_lines_amount = this.#current_coll_lines - non_arr_coll_max_lines;

                    return false;
                }
                this.#current_coll_lines++;
                return true;
            }
            /*If current line has smaller indent resetting values and not exiting check for current line.*/
            else {
                this.#is_after_shorten_check_line = true;

                this.#expected_indent = '';
                this.#inner_indent_length = 0;
                this.#lines_need_shorten_check = false;
                this.#current_coll_lines = 0;
            }
        }
        else {
            this.#is_after_shorten_check_line = false;
        }

        let line_match = line.match(line_to_shorten_regex);

        if (line_match == null) return true;

        this.#expected_indent = ' '.repeat(line_match[1].length + 1);
        this.#inner_indent_length = this.#expected_indent.length;
        this.#lines_need_shorten_check = true;
        return true;
    }

    shorten_output_lines(output_lines, options) {
        if (Array.isArray(output_lines) === false) {
            throw new Error(`"output_lines" argument is not Array. Expected otherwise.
Argument "output_lines" has value:
${util.inspect(output_lines)}.`);
        }

        let shorten_output = [];
        let output_lines_length = output_lines.length;
        for (let i = 0; i < output_lines_length; i++) {
            let line = output_lines[i];
            let line_is_included = this[_need_to_exclude](line, options);

            if (
                /*If it is next line after shorten check finished print info about shorten lines.
                * Applying the same, if last line is also under check.*/
                (this.#is_after_shorten_check_line === true)
                || (i + 1 === output_lines_length && line_is_included === false)
            ) {
                let [previous_line_indent] = output_lines[i - 1].match(indent_regex);
                shorten_output.push(`${previous_line_indent} ... ${this.#previous_excluded_lines_amount} more lines`);
            }

            if (line_is_included === true) shorten_output.push(line);
        }

        return shorten_output;
    }
}

/**
 * @typedef {Object} stringify_val_for_print_opts
 * @property {Integer} obj_depth Specifies the number of times to recurse while formatting the object.
 * @property {Integer} max_arr_length Specifies the maximum number of array and TypedArray elements to include when formatting.
 * @property {Integer} break_length The length at which an object's keys are split across multiple lines. Set to Infinity to format an object as a single line.
 * @property {Integer|Null} max_lines_amount Specifies the maximum number of lines in stringified value. If amount of lines exceeds max amount, last line is used for "more lines" text. Set to Null to set no maximum.
 * @property {Boolean} is_text_with_os_specific_eol If true prints uses "toString()" method to print the value and os specific EOL.
 * @property {Boolean} shorten_non_arr_colls If true will shorten collections like Map, Set.
 */
let stringify_val_for_print_merge_opts = ({
                                              obj_depth = 10,
                                              max_arr_length = 30,
                                              max_non_arr_length = null,
                                              max_lines_amount = 200,
                                              break_length = 100,

                                              is_text_with_os_specific_eol = false,
                                              shorten_non_arr_colls = false,
                                          } = {}) => {
    if (max_non_arr_length !== null && Number.isInteger(max_non_arr_length) !== true) {
        throw new Error(`"max_non_arr_length" argument is not Integer. Expected otherwise.
Argument "max_non_arr_length" has value:
${util.inspect(max_non_arr_length)}.`);
    }

    return {
        obj_depth,
        max_arr_length,
        max_non_arr_length,
        max_lines_amount,
        break_length,

        is_text_with_os_specific_eol,
        shorten_non_arr_colls,
    };
};

function prepare_non_arr_coll(obj, max_non_arr_length) {
    let has_shortened_coll = false;
    let value = map_explore_deep(obj, (value, key, object) => {
        if (util.types.isMap(value) === true) {
            if (has_shortened_coll === false) {
                has_shortened_coll = true;
            }

            let shorten_map = new Map();
            let i = 0;
            for (let entry of value) {
                let [key, value] = entry;
                shorten_map.set(key, value);
                i++;
                if (i >= max_non_arr_length) break;
            }
            return {result: true, value: shorten_map};
        }
        else if (util.types.isSet(value) === true) {
            if (has_shortened_coll === false) {
                has_shortened_coll = true;
            }

            let shorten_set = new Set();
            let i = 0;
            for (let item of value) {
                shorten_set.add(item);
                i++;
                if (i >= max_non_arr_length) break;
            }
            return {result: true, value: shorten_set};
        }
        else if (util.types.isWeakMap(value) === true) {
            if (has_shortened_coll === false) {
                has_shortened_coll = true;
            }

            let shorten_weak_map = new WeakMap();
            let i = 0;
            for (let entry of value) {
                let [key, value] = entry;
                shorten_weak_map.set(key, value);
                i++;
                if (i >= max_non_arr_length) break;
            }
            return {result: true, value: shorten_weak_map};
        }
        else if (util.types.isWeakSet(value) === true) {
            if (has_shortened_coll === false) {
                has_shortened_coll = true;
            }

            let shorten_weak_set = new WeakSet();
            let i = 0;
            for (let item of value) {
                shorten_weak_set.add(item);
                i++;
                if (i >= max_non_arr_length) break;
            }
            return {result: true, value: shorten_weak_set};
        }

        return {result: false};
    });

    return {value, info: {has_shortened_coll}};
}

/**
 * Function is intended to print string representation of any value as good as possible using provided limits.
 * @param {*} val Object or any primitive
 * @param {Object} [options] {@link stringify_val_for_print_opts}
 * @return {String}
 */
function stringify_val_for_print(val, options) {
    let {
        obj_depth,
        max_arr_length,
        max_non_arr_length,
        max_lines_amount,
        break_length,

        is_text_with_os_specific_eol,
        shorten_non_arr_colls,
    } = stringify_val_for_print_merge_opts(options);

    if (max_lines_amount !== null && max_lines_amount < 1) {
        throw new Error(`${Object.keys({max_lines_amount})[0]}:"${max_lines_amount}" is less than "1". Please use ${Object.keys({max_lines_amount})[0]} more or equal to "1".`);
    }

    let non_arr_coll_are_shortened = false;
    if (max_non_arr_length !== null) {
        let {value, info: {has_shortened_coll}} = prepare_non_arr_coll(val, max_non_arr_length);
        val = value;
        non_arr_coll_are_shortened = has_shortened_coll;
    }

    let val_all_lines_str;
    if (is_text_with_os_specific_eol === false) {
        val_all_lines_str = util.inspect(val, {depth: obj_depth, maxArrayLength: max_arr_length, breakLength: break_length});
        if (shorten_non_arr_colls === false && max_lines_amount === null) return val_all_lines_str;
    }
    else {
        val_all_lines_str = val.toString();
    }

    let lines_separator;
    if (is_text_with_os_specific_eol === false) {
        //lines_separator, which by default used in node util.inspect()
        lines_separator = '\n';
    }
    else {
        lines_separator = os.EOL;
    }
    let val_all_lines_arr = val_all_lines_str.split(lines_separator);

    if (max_non_arr_length !== null && non_arr_coll_are_shortened === true) {
        val_all_lines_arr.unshift(`Note. All non array collections below are shorten to ${max_non_arr_length} items.`);
    }

    if (shorten_non_arr_colls === true) {
        val_all_lines_arr = new Node_inspect_mgmt().shorten_output_lines(val_all_lines_arr, options);
    }

    let val_all_lines_amount = val_all_lines_arr.length;
    //if value is one-liner string just return it
    if (val_all_lines_amount === 1) {
        return val_all_lines_arr[0];
    }

    if (val_all_lines_amount <= max_lines_amount || max_lines_amount === null) {
        return join_arr(val_all_lines_arr, lines_separator);
    }
    else {
        //getting only amount of lines limited by max_lines_amount minus lines for 'more lines' text
        let lines_amount_wo_more_lines_text = max_lines_amount - 1;
        let val_limited_lines_arr = val_all_lines_arr.slice(0, lines_amount_wo_more_lines_text);
        let val_left_lines_amount = val_all_lines_amount - lines_amount_wo_more_lines_text;
        //part of text which is printed in case array has more items than maxArrayLength for node util.inspect()
        return join_arr(val_limited_lines_arr, lines_separator) + `\n ... ${val_left_lines_amount} more lines`;
    }
}

module.exports = {
    stringify_val_for_print: stringify_val_for_print,
};