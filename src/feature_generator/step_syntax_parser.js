'use strict';
//Modules
const os = require('os');
const _lang = require('lodash/lang');
const _object = require('lodash/object');
const JSON5 = require('json5');
//Local utils
const {clone_deep} = require('../../utils/object/deep_obj_operations');
const type_checks = require('../../utils/checks/type_checks');
const type_mand_checks = require('../../utils/checks/type_mand_checks');
const {throw_err_with_args_print} = require('../../utils/errors/custom_errors');
const {get_var_name} = require('../../utils/errors/error_info');
const {merge_opts_by_func} = require('../../utils/object/merge_options');

//region Feature grounds text generation.
const get_step_text_for_run_steps_from_scenario = (scenario_name, file_name) => {
    type_mand_checks.is_string_mand(scenario_name, 'scenario_name');
    type_mand_checks.is_string_mand(file_name, 'file_name');
    /*By default step is formatted with 4 spaces.*/
    return `    When run steps from ${scenario_name} scenario in ${file_name} file`;
};

const get_create_ground_content_opts = ({
                                            gen_feature_name_func = (file_name) => `Feature: Run ${file_name} scenarios`,
                                            main_scenario_name = 'main'
                                        }) => {
    type_mand_checks.is_function_mand(gen_feature_name_func, 'ground_name_mod_func');
    type_mand_checks.is_string_mand(main_scenario_name, 'main_scenario_name');

    return {
        gen_feature_name_func,
        main_scenario_name,
    };
};

const create_ground_content = (trunk_data, options) => {
    let {scenarios, file_path, file_name} = trunk_data;
    let steps = '';
    let scenarios_length = scenarios.length;
    let scenarios_last_idx = scenarios_length - 1;
    for (let i = 0; i < scenarios_length; i++) {
        let scenario = scenarios[i];
        let name = scenario.name;
        if (name == null) {
            throw_err_with_args_print(`Internal error. Scenario name is absent`,
                {name: 'scenario', value: scenario},
                {name: 'scenarios', value: scenarios},
                {name: 'file_path', value: file_path},
                {name: 'file_name', value: file_name}
            );
        }

        let step = get_step_text_for_run_steps_from_scenario(scenario.name, file_name);

        /*If not last step: add new line.*/
        if (i < scenarios_last_idx) {
            steps += `${step}\n`;
        }
        /*If last step add no new line.*/
        else {
            steps += step;
        }
    }

    let {
        gen_feature_name_func,
        main_scenario_name
    } = merge_opts_by_func(options, get_create_ground_content_opts);

    let feature_init = gen_feature_name_func(file_name);
    type_mand_checks.is_string_mand(feature_init, 'ground feature name');
    /*By default scenario name is formatted with 2 spaces.*/
    let scenario_init = `  Scenario: ${main_scenario_name}`;
    /*Adding empty lines to make feature file more readable:
    * between feature name and scenario name.*/
    return `${feature_init}\n\n${scenario_init}\n${steps}`;
};
//endregion

//region Helper functions
const apply_replacements = (replacements, scenario_str) => {
    type_mand_checks.is_array_mand(replacements, 'replacements');

    for (let replacement_obj of replacements) {
        /*Receiving properties only after check to resolve problem with "null" values.*/
        let regex = type_mand_checks.is_string_mand(replacement_obj.regex, 'replacement_obj.regex');
        let replacement = type_mand_checks.is_string_mand(replacement_obj.replacement, 'replacement_obj.replacement');

        scenario_str = scenario_str.replace(new RegExp(`${regex}`, 'g'), replacement);
    }
    return scenario_str;

};
const apply_multiple_runs = (times_to_run, scenario_str) => {
    times_to_run = type_mand_checks.is_parsed_to_positive_int_mand(times_to_run, 'times_to_run');

    return (scenario_str + os.EOL).repeat(times_to_run);
};
// endregion

//region check_is_run_steps_from_scenario_in_file_step
/*All check functions for generating steps from scenario in some feature-like file should return object with properties:
* "result", "value:{scenario_name, file_name}".
* "scenario_str_transformer" property in value object is optional.*/
const run_steps_from_scenario_in_file_regexp = /^ *run +steps +from +((?:.| )*) +scenario +in +((?:.| )*) +file *$/;
const check_is_run_steps_from_scenario_in_file_step = (step_main_data) => {
    let match = step_main_data.text.match(run_steps_from_scenario_in_file_regexp);
    if (match == null) {
        return {result: false};
    }
    else {
        let value = {};
        let doc_string = step_main_data.doc_string;
        if (doc_string != null) {
            let {replacements, times_to_run} = JSON5.parse(doc_string);

            value.scenario_str_transformer = (scenario_str) => {
                let result_str = scenario_str;
                if (replacements != null) {
                    result_str = apply_replacements(replacements, scenario_str);
                }
                if (times_to_run != null) {
                    result_str = apply_multiple_runs(times_to_run, scenario_str);
                }
                return result_str;
            };
        }
        let [matched_text, scenario_name, file_name] = match;
        value.scenario_name = scenario_name;
        value.file_name = file_name;

        return {result: true, value};
    }
};
//endregion

//region find_steps_loc_by_conditions
const scenario_name_prop_name = 'scenario_name';
const file_name_prop_name = 'file_name';
const conditions_prop_name = 'conditions';
function find_steps_loc_by_conditions(steps_loc_objs, conditions) {
    type_mand_checks.is_array_mand(steps_loc_objs, 'steps_loc_objs');
    let matching_step_loc_objs = [];
    /*Making copy to manipulate defaults and other data.*/
    let _steps_loc_objs = clone_deep(steps_loc_objs);

    for (let step_loc_obj of _steps_loc_objs) {
        //region find_steps_loc_by_conditions. Check types for properties in steps_loc_objs and make transformation
        type_mand_checks.is_string_mand(step_loc_obj[scenario_name_prop_name], scenario_name_prop_name);
        type_mand_checks.is_string_mand(step_loc_obj[file_name_prop_name], file_name_prop_name);
        /*If there are no "conditions" property assume that it is step_loc_obj which will be triggered as default.
        * As a result using empty array as unification to show there are no conditions.*/
        let loc_conditions = _object.get(step_loc_obj, conditions_prop_name, null);
        let loc_conditions_is_object_check = type_checks.is_object(loc_conditions);
        /*Trigger handlers for "loc_conditions" in not appropriate format.*/
        if (loc_conditions_is_object_check.result === false) {
            if (loc_conditions == null) {
                loc_conditions = {};
                /*Updating "conditions" with value null or undefined to follow one format.*/
                step_loc_obj[conditions_prop_name] = {};
            }
            else {
                throw_err_with_args_print(`"${conditions_prop_name}" property has non-object value. Please use object as value for the property.`,
                    {name: 'steps_loc_objs', value: steps_loc_objs},
                    {name: 'conditions', value: conditions}
                );
            }
        }
        //endregion

        let non_matching_condition_is_present = false;
        for (let loc_condition of Object.entries(loc_conditions)) {
            let [condition_name, condition_value] = loc_condition;
            /*Using "isEqual" method to handle case, when condition is an object.*/
            /*If condition is absent or values does not match step_loc_obj is not matching.*/
            if (conditions.hasOwnProperty(condition_name) === false || _lang.isEqual(condition_value, conditions[condition_name]) === false) {
                non_matching_condition_is_present = true;
                break;
            }
        }
        if (non_matching_condition_is_present === false) {
            matching_step_loc_objs.push(step_loc_obj);
        }
    }
    //region find_steps_loc_by_conditions. Checking for step conditions duplicates and diverse matching variants.
    let matching_step_loc_objs_amount = matching_step_loc_objs.length;
    if (matching_step_loc_objs_amount === 1) {
        return matching_step_loc_objs[0];
    }
    else if (matching_step_loc_objs_amount === 0) {
        throw_err_with_args_print(`There are no matches between expected conditions and provided condition sets. Please use appropriate conditions.`,
            {name: 'steps_loc_objs', value: steps_loc_objs},
            {name: 'conditions', value: conditions}
        );
    }
    else if (matching_step_loc_objs_amount > 1) {
        /*Sorting conditions sets: from smaller to bigger sets.
        * This will help to define which condition set to use: more conditions, means more exact case.
        * Also this will help to check there are no matches with same weight.
        * For example, 2 condition sets have diverse conditions, but same amount of conditions.*/
        let matching_step_loc_objs_sorted = matching_step_loc_objs.sort((step_loc_obj1, step_loc_obj2) => {
            return Object.keys(step_loc_obj1[conditions_prop_name]).length - Object.keys(step_loc_obj2[conditions_prop_name]).length;
        });
        let matching_objs_checks = matching_step_loc_objs_checks(matching_step_loc_objs);
        let checks_result = matching_objs_checks.make_validations();
        if (checks_result.result === true) {
            return matching_step_loc_objs_sorted[matching_step_loc_objs_sorted.length - 1];
        }
        else {
            throw_err_with_args_print(`Invalid combinations of matching conditions sets are present. As a result it is impossible to choose only one of them for match. Please specify correct combinations of mathcing conditions.`,
                {name: 'failed_checks_data', value: checks_result.failed_checks_data},
                {name: 'steps_loc_objs', value: steps_loc_objs},
                {name: 'conditions', value: conditions}
            );
        }
    }
    else {
        throw_err_with_args_print(`Invalid "${get_var_name({matching_step_loc_objs_amount})}" value. Please check the code.`,
            {name: 'matching_step_loc_objs_amount', value: matching_step_loc_objs_amount},
            {name: 'steps_loc_objs', value: steps_loc_objs},
            {name: 'conditions', value: conditions}
        );
    }
    //endregion
}
const _get_conditions_check_data = Symbol('_get_conditions_check_data');
const _check_no_non_stackable_condition_set = Symbol('_check_no_non_stackable_condition_set');
const _check_no_duplicated_condition_amounts = Symbol('_check_no_duplicated_condition_amounts');
const matching_step_loc_objs_checks = (sorted_matching_step_loc_objs) => ({
    _checks_are_failed: false,

    _unique_condition_types: new Set(),
    _has_non_stackable_condition_set: false,

    /*Not initiating as collections to improve performance for case with all passed checks.*/
    _previous_maximum_of_conditions: null,
    _current_maximum_of_conditions: null,
    _duplicated_condition_idxs: null,
    _sorted_matching_step_loc_objs: sorted_matching_step_loc_objs,

    [_get_conditions_check_data](step_loc_obj) {
        let condition_types = Object.keys(step_loc_obj[conditions_prop_name]);
        let conditions_amount = condition_types.length;
        return {condition_types, conditions_amount};
    },

    [_check_no_non_stackable_condition_set](condition_types) {
        for (let condition_type of condition_types) {
            this._unique_condition_types.add(condition_type);
        }

        if (this._unique_condition_types.size > this._current_maximum_of_conditions) {
            if (this._checks_are_failed === false) {
                this._checks_are_failed = true;
            }
            return (this._has_non_stackable_condition_set = true);
        }
        return this._has_non_stackable_condition_set;
    },

    [_check_no_duplicated_condition_amounts]() {
        let result = !(this._current_maximum_of_conditions === this._previous_maximum_of_conditions);
        if (result === false && this._checks_are_failed === false) {
            this._checks_are_failed = true;
        }
        return result;
    },
    /**
     *
     * @return {{result:Boolean}|{result:Boolean,failed_checks_data:Object}} Only if one of checks failed return false and failed_checks_data.
     */
    make_validations() {
        let failed_checks_data = {};
        for (let i = 0; i < this._sorted_matching_step_loc_objs.length; i++) {
            /*Setup data for checks.*/
            let {condition_types, conditions_amount} = this[_get_conditions_check_data](this._sorted_matching_step_loc_objs[i]);
            this._current_maximum_of_conditions = conditions_amount;
            /*Making checks.*/
            /*Check has_non_stackable_condition_set.*/
            if (this._has_non_stackable_condition_set === false) {
                let no_non_stackable_check_result = this[_check_no_non_stackable_condition_set](condition_types);
                if (no_non_stackable_check_result === true) {
                    failed_checks_data.has_non_stackable_condition_set = true;
                }
            }
            /*Check has_non_stackable_condition_set.*/
            let no_duplicated_conditions_check_result = this[_check_no_duplicated_condition_amounts]();
            if (no_duplicated_conditions_check_result === false) {
                /*Initiating collection in case it is not initiated.*/
                if (this._duplicated_condition_idxs == null) {
                    this._duplicated_condition_idxs = new Set();
                    failed_checks_data.step_loc_objs_with_same_amount_of_conditions = [];
                }
                /*If there are no previous index, then previous duplicate was not added.*/
                if (this._duplicated_condition_idxs.has(i - 1) === false) {
                    failed_checks_data.step_loc_objs_with_same_amount_of_conditions.push(this._sorted_matching_step_loc_objs[i - 1]);
                    this._duplicated_condition_idxs.add(i - 1);
                }
                failed_checks_data.step_loc_objs_with_same_amount_of_conditions.push(this._sorted_matching_step_loc_objs[i]);
                this._duplicated_condition_idxs.add(i);
            }
            /*Teardown for checks.
            * Used for future checks.*/
            this._previous_maximum_of_conditions = conditions_amount;
        }
        if (this._checks_are_failed === true) {
            return {result: false, failed_checks_data};
        }
        return {result: true};
    },
});

const run_steps_by_input_regexp = /^ *run +steps +by +input: *$/;
const get_check_is_run_steps_by_input = (conditions) => (step_main_data) => {
    let result = run_steps_by_input_regexp.test(step_main_data.text);
    if (result === false) {
        return {result: false};
    }
    else {
        let doc_string = step_main_data.doc_string;
        if (doc_string == null) {
            throw_err_with_args_print(`Expected step with DocString, but no found. Please use step with DocString.`,
                {name: 'step_main_data', value: step_main_data},
                {name: 'run_steps_by_input_regexp', value: run_steps_by_input_regexp.toString()},
                {name: 'conditions', value: conditions}
            );
        }

        let steps_loc_objs = JSON5.parse(doc_string);
        let {scenario_name, file_name} = find_steps_loc_by_conditions(steps_loc_objs, conditions);

        return {result: true, value: {scenario_name, file_name}};
    }
};
//endregion

const get_check_steps_for_generation_pattern_full = (condtions) => (step_main_data) => {
    let run_steps_by_location_check = check_is_run_steps_from_scenario_in_file_step(step_main_data);
    if (run_steps_by_location_check.result === true) {
        return run_steps_by_location_check;
    }
    let run_steps_by_conditions_check = get_check_is_run_steps_by_input(condtions)(step_main_data);
    if (run_steps_by_conditions_check.result === true) {
        return run_steps_by_conditions_check;
    }
    return {result: false};
};

module.exports = {
    check_is_run_steps_from_scenario_in_file_step: check_is_run_steps_from_scenario_in_file_step,
    get_check_steps_for_generation_pattern_full: get_check_steps_for_generation_pattern_full,
    create_ground_content: create_ground_content,
};