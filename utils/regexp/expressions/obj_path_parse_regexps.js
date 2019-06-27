'use strict';
const has_int_in_sqr_brackets_str = `/.*\\[-?(0|[1-9]\\d*)].*/`;
const has_integer_in_sqr_brackets = new RegExp(has_int_in_sqr_brackets_str);

module.exports = {
    has_int_in_sqr_brackets_str: has_int_in_sqr_brackets_str,
    has_integer_in_sqr_brackets: has_integer_in_sqr_brackets,
};