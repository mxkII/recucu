'use strict';
//Modules
const fse = require('fs-extra');
const path = require('path');
const Gherkin = require('gherkin');
//Models
const {Scenario_main_data, Step_main_data} = require('../models/basic');
//Local utils
const {throw_err_with_args_print} = require('../../utils/errors/custom_errors');
const type_mand_checks = require('../../utils/checks/type_mand_checks');
const {get_duplicates} = require('../../utils/collections/array/duplicates');

class Feature_file_parser {
    #file_name = null;
    /**
     *
     * @return {String}
     */
    get file_name() {
        return (this.#file_name == null)
            ? this.store_file_name()
            : this.#file_name;
    }

    #file_content = null;
    /**
     *
     * @return {Promise<*>|String}
     */
    get file_content() {
        return this.#file_content == null
            ? this.store_file_content()
            : this.#file_content;
    }

    #file_line_to_str_coll = new Map();
    /**
     *
     * @return {Promise<*>|Map}
     */
    get file_line_to_str_coll() {
        return this.#file_line_to_str_coll.size === 0
            ? this.store_file_line_to_str_coll()
            : this.#file_line_to_str_coll;
    }

    #scenario_name_to_str_data_coll = new Map();

    #file_ast = null;
    /**
     *
     * @return {Promise<*>|Object}
     */
    get file_ast() {
        return this.#file_ast == null
            ? this.store_file_ast()
            : this.#file_ast;
    }

    #scenario_asts = null;
    /**
     *
     * @returns {Promise<*>|Array<*>}
     */
    get scenario_asts() {
        if (this.#scenario_asts == null) {
            return this.store_scenario_asts();
        }
        return this.#scenario_asts;
    }

    #scenario_name_to_ast_coll = new Map();
    /**
     *
     * @returns {Promise<*>|Map<*>}
     */
    get scenario_name_to_ast_coll() {
        return this.#scenario_name_to_ast_coll.size === 0
            ? this.store_scenario_name_to_data()
            : this.#scenario_name_to_ast_coll;
    }

    #scenario_name_to_main_data_coll = new Map();
    /**
     *
     * @returns {Promise<*>|Map<*>}
     */
    get scenario_name_to_main_data_coll() {
        return this.#scenario_name_to_main_data_coll.size === 0
            ? this.store_scenario_name_to_data()
            : this.#scenario_name_to_main_data_coll;
    }

    #scenario_name_to_steps_main_data_coll = new Map();
    /**
     *
     * @returns {Promise<*>|Map<*>}
     */
    get scenario_name_to_steps_main_data_coll() {
        return this.#scenario_name_to_steps_main_data_coll.size === 0
            ? this.store_scenario_name_to_data()
            : this.#scenario_name_to_steps_main_data_coll;
    }

    #gherkin_parser = new Gherkin.Parser();

    constructor(full_path) {
        type_mand_checks.is_absolute_path_mand(full_path, 'full path of gherkin file');
        this.full_path = full_path;
    }

    //region Get data from Gherkin object
    //region Basic data
    #get_first_line = (entity_with_line) => entity_with_line.location.line;

    #get_scenario_asts = (file_ast) => file_ast.feature.children;

    #get_scenario_name = (scenario_ast) => scenario_ast.name;
    #get_steps_ast = (scenario_ast) => scenario_ast.steps;

    #get_step_argument = (step_ast) => step_ast.argument;
    #get_step_type = (step_ast) => step_ast.type;
    #get_step_keyword = (step_ast) => step_ast.keyword;
    #get_step_text = (step_ast) => step_ast.text;

    #get_argument_content = (step_argument) => step_argument.content;
    #get_argument_rows = (step_argument) => step_argument.rows;
    #get_argument_type = (step_argument) => step_argument.type;

    #get_argument_content_by_step_ast = (step_ast) => {
        let argument = this.#get_step_argument(step_ast);
        return (argument != null)
            ? this.#get_argument_content(step_ast)
            : null;
    };
    #get_argument_type_by_step_ast = (step_ast) => {
        let argument = this.#get_step_argument(step_ast);
        return (argument != null)
            ? this.#get_argument_type(step_ast)
            : null;
    };
    //endregion

    //region Custom data
    #get_step_lines = (step_ast) => {
        let start = this.#get_first_line(step_ast);
        let end;
        let step_argument = this.#get_step_argument(step_ast);
        if (step_argument == null) {
            end = start;
        }
        else {
            switch (this.#get_argument_type(step_argument)) {
                case "DocString":
                    /*Splitting by new line: considering first line as new one.*/
                    let doc_string_lines_amount = this.#get_argument_content(step_argument).split('\n').length;
                    /*Adding line for closing mark of doc string.*/
                    end = this.#get_first_line(step_argument) + doc_string_lines_amount + 1;
                    break;
                case "DataTable":
                    let rows_coll = this.#get_argument_rows(step_argument);
                    end = this.#get_first_line(rows_coll[rows_coll.length - 1]);
                    break;
                default:
                    throw new Error(`Internal error. Step argument type "${this.#get_argument_type(step_argument)} is not yet implemented. Please use no or other step arguments for now."`);
            }
        }
        return {start, end};
    };

    #get_scenario_main_data = (scenario_ast) => {
        let steps_ast = this.#get_steps_ast(scenario_ast);
        let steps_last_idx = steps_ast.length - 1;

        let scenario_first_line = this.#get_first_line(scenario_ast);
        let scenario_last_line = this.#get_step_lines(steps_ast[steps_last_idx]).end;

        return new Scenario_main_data(scenario_ast.name, {
            start: scenario_first_line,
            end: scenario_last_line
        }, {
            start: scenario_first_line + 1,
            end: scenario_last_line
        });
    };
    //endregion
    //endregion

    //region Store file content methods
    store_file_name() {
        return (this.#file_name = path.parse(this.full_path).name);
    }

    async store_file_content() {
        return (this.#file_content = await fse.readFile(this.full_path, 'utf8'));
    }

    async store_file_line_to_str_coll() {
        let file_content_str = await this.file_content;

        let first_new_line = file_content_str.indexOf('\n');
        let carriage_is_present = false;
        /*Checking for carriage, If first new line is not a first symbol.
        * Else new line is a first symbol and there can be no carriage, except very old Mac OS versions.
        * In this case "first_new_line" is "-1" and "carriage_is_present" is "false" by default.*/
        if (first_new_line > 0) {
            carriage_is_present = file_content_str[first_new_line - 1] === '\r';
        }

        let file_line_arr;
        /*Assuming that combination of new lines with and without carriage in the same file is illegal or made by mistake.*/
        if (carriage_is_present === false) {
            if (file_content_str.indexOf('\r\n') >= 0) {
                throw_err_with_args_print(`File has both line break types: \\r\\n and \\n. Expected only one.`,
                    {name: 'full_path', value: this.full_path},
                    {name: 'file_content_str', value: file_content_str},
                );
            }

            file_line_arr = file_content_str.split('\n');
        }
        else {
            file_line_arr = file_content_str.split('\r\n');
        }

        for (let i = 0; i < file_line_arr.length; i++) {
            this.#file_line_to_str_coll.set(i + 1, file_line_arr[i]);
        }
        return this.#file_line_to_str_coll;
    }
    //endregion

    //region Store feature file objects methods
    async store_file_ast() {
        return (this.#file_ast = this.#gherkin_parser.parse(await this.file_content));
    }

    #check_scenario_names_unique = (scenario_asts) => {
        let unique_scenario_names = new Set();
        for (let scenario_ast of scenario_asts) {
            let scenario_name = this.#get_scenario_name(scenario_ast);
            if (unique_scenario_names.has(scenario_name) === false) {
                unique_scenario_names.add(scenario_name);
            }
            else {
                let scenario_names = scenario_asts.map(
                    (scenario_ast) => this.#get_scenario_name(scenario_ast)
                );
                let duplicate_scenario_names = get_duplicates(scenario_names);
                throw_err_with_args_print('Found non-unique scenario names. Expected otherwise.',
                    {name: 'duplicate scenario names in feature', value: duplicate_scenario_names},
                    {name: 'feature full path', value: this.full_path}
                );
            }
        }
    };

    async store_scenario_asts() {
        let scenario_asts = this.#get_scenario_asts(await this.file_ast);
        this.#check_scenario_names_unique(scenario_asts);
        return (this.#scenario_asts = scenario_asts);
    }

    #create_steps_main_data = (steps_ast) => {
        let steps_main_data = [];
        for (let i = 0; i < steps_ast.length; i++) {
            let step_ast = steps_ast[i];
            if (this.#get_step_type(step_ast) === 'Step') {
                let lines = this.#get_step_lines(step_ast);
                let step_main_data = new Step_main_data(
                    this.#get_step_keyword(step_ast),
                    this.#get_step_text(step_ast),
                    lines
                );
                /*Adding arguments to "steps_main_data", if there are some.*/
                let step_arg_type = this.#get_argument_type_by_step_ast(step_ast);
                if (step_arg_type != null && step_arg_type === 'DocString') {
                    step_main_data.doc_string = this.#get_argument_content_by_step_ast(step_ast);
                }
                steps_main_data.push(step_main_data);
            }
        }
        return steps_main_data;
    };

    async store_scenario_name_to_data() {
        for (let scenario_ast of (await this.scenario_asts)) {
            let scenario_name = this.#get_scenario_name(scenario_ast);

            this.#scenario_name_to_ast_coll.set(scenario_name, scenario_ast);

            this.#scenario_name_to_main_data_coll.set(
                scenario_name,
                this.#get_scenario_main_data(scenario_ast)
            );

            let steps_ast = this.#get_steps_ast(scenario_ast);
            this.#scenario_name_to_steps_main_data_coll.set(
                scenario_name,
                this.#create_steps_main_data(steps_ast)
            );
        }

        /*Receiving property values from getters, to make sure:
        * all necessary checks are passed if were present.*/
        return {
            scenario_name_to_ast_coll: this.scenario_name_to_ast_coll,
            scenario_name_to_main_data_coll: this.scenario_name_to_main_data_coll,
            scenario_name_to_steps_main_data_coll: this.scenario_name_to_steps_main_data_coll
        };
    }
    //endregion

    //region

    #store_scenario_strings = async (scenario_name) => {
        let scenario_main_data = (await this.scenario_name_to_main_data_coll).get(scenario_name);
        let scenario_inner_lines = scenario_main_data.inner_lines;

        let scenario_line_to_str_coll = new Map();

        for (let i = scenario_inner_lines.start; i < scenario_inner_lines.end + 1; i++) {
            scenario_line_to_str_coll.set(i, (await this.file_line_to_str_coll).get(i));
        }

        this.#scenario_name_to_str_data_coll.set(scenario_name, scenario_line_to_str_coll);

        return {
            scenario_line_to_str_coll,
            scenario_name_to_str_data_coll: this.#scenario_name_to_str_data_coll,
        };
    };

    async get_scenario_line_to_str_coll(scenario_name) {
        /*If scenario strings are absent, adding them and
        * immediately making return, not to waste time on retrieving value from collection.*/
        if (this.#scenario_name_to_str_data_coll.get(scenario_name) == null) {
            return (await this.#store_scenario_strings(scenario_name))
                .scenario_line_to_str_coll;
        }
        return this.#scenario_name_to_str_data_coll.get(scenario_name);
    }
    //endregion

    //region Additional info methods
    /*nt Not required for generation, but can be used after it.*/
    /**
     *
     * @return {Promise<Object>}
     */
    async get_feature_bounds_info() {
        let file_ast = await this.file_ast;
        let name = this.file_name;
        let scenarios = this.#get_scenario_asts(file_ast);
        let first_scenario_start_line = scenarios[0].location.line;
        let last_scenario_start_line = scenarios[scenarios.length - 1].location.line;

        return {
            name,
            scenarios: {
                first: {
                    lines: {
                        start: first_scenario_start_line,
                    }
                },
                last: {
                    lines: {
                        start: last_scenario_start_line,
                    }
                },
            },
            get first_scenario_line() {
                return this.scenarios.first.lines.start;
            },
            get last_scenario_line() {
                return this.scenarios.last.lines.start;
            }
        };
    }
    //endregion
}

module.exports = {
    Feature_file_parser,
};
