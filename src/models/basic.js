'use strict';
//Local utils
const type_mand_checks = require('../../utils/checks/type_mand_checks');

class Lines {
    constructor({start, end}) {
        this.start = type_mand_checks.is_integer_mand(start, 'start line');
        this.end = type_mand_checks.is_integer_mand(end, 'end line');
    }
}

class Scenario_main_data {
    /**
     *
     * @param {String} name
     * @param {{start:Integer,end:Integer}} lines
     * @param {{start:Integer,end:Integer}} inner_lines
     */
    constructor(name, lines, inner_lines) {
        this.name = type_mand_checks.is_string_mand(name, 'scenario name');
        this.lines = new Lines(lines);
        this.inner_lines = new Lines(inner_lines);
    }
}

class Step_main_data {
    /**
     *
     * @param {String} keyword Step type: Given, When, Then or other
     * @param {String} text Step definition text
     * @param {{start:Integer,end:Integer}} lines
     */
    constructor(keyword, text, lines) {
        this.keyword = type_mand_checks.is_string_mand(keyword, 'step keyword');
        this.text = type_mand_checks.is_string_mand(text, 'step text');
        this.lines = new Lines(lines);
    }
}

module.exports = {
    Lines,
    Scenario_main_data,
    Step_main_data,
};
