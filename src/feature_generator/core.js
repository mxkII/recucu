'use strict';
//Modules
const fse = require('fs-extra');
const path = require('path');
const globby = require('globby');
const os = require('os');
//Local utils
const {throw_err_with_args_print} = require('../../utils/errors/custom_errors');
const type_mand_checks = require('../../utils/checks/type_mand_checks');
const {get_duplicates} = require('../../utils/collections/array/duplicates');
const {merge_opts_by_func} = require('../../utils/object/merge_options');
const {check_circular_seq} = require('../../utils/checks/circular_check');
//Feature generation utils
const {
    check_is_run_steps_from_scenario_in_file_step,
    create_ground_content
} = require('./step_syntax_parser');
const {Feature_file_parser} = require('../feature_file_data/feature_file_data');

const featurepart_patterns_dflt = ['**/*.feature'];
const featuresource_patterns_dflt = ['**/*.feature'];
const feature_extension_dflt = '.feature';

class Feature_file_generator {
    /**
     *
     * @return {Promise<*>|Map<*>}
     */
    #part_file_path_to_name_coll = new Map();
    get part_file_path_to_name_coll() {
        return this.#part_file_path_to_name_coll.size === 0
            ? this.#store_file_path_and_name_data()
            : this.#part_file_path_to_name_coll;
    }
    /**
     *
     * @return {Promise<*>|Map<*>}
     */
    #part_file_name_to_path_coll = new Map();
    get part_file_name_to_path_coll() {
        return this.#part_file_name_to_path_coll.size === 0
            ? this.#store_file_path_and_name_data()
            : this.#part_file_name_to_path_coll;
    }
    /**
     *
     * @return {Promise<*>|Map<*>}
     */
    #trunk_file_path_to_name = new Map();
    get trunk_file_path_to_name() {
        return this.#trunk_file_path_to_name.size === 0
            ? this.#store_trunk_file_path_to_name()
            : this.#trunk_file_path_to_name;
    }

    #part_path_to_feature_file_data_coll = new Map();
    #source_path_to_feature_file_data_coll = new Map();

    constructor(featurepart_categories_dir) {
        type_mand_checks.is_string_mand(featurepart_categories_dir, 'featurepart_categories_dir');
        this.featurepart_categories_dir = featurepart_categories_dir;
    }

    //region Feature_file_generator. Options

    #get_main_opts = ({
                          featurepart_patterns = featurepart_patterns_dflt,
                          featuresource_patterns = featuresource_patterns_dflt,
                          featurepart_path = this.featurepart_categories_dir,
                          featuresource_path = this.featurepart_categories_dir,
                      }) => {
        if(featurepart_path == null) featurepart_path = this.featurepart_categories_dir;
        if(featuresource_path == null) featuresource_path = this.featurepart_categories_dir;

        return {
            featurepart_patterns,
            featuresource_patterns,
            featurepart_path,
            featuresource_path,
        };
    };

    #merge_main_opts = (options) => {
        /*Without "bind" class instance "this" will not be attached inside a function*/
        return merge_opts_by_func(options, this.#get_main_opts.bind(this));
    };
    //endregion

    //region Feature_file_generator. File generation
    #get_gen_feature_opts = ({
                                 feature_dir = this.featurepart_categories_dir,
                                 feature_extension = feature_extension_dflt,
                                 get_steps_loc_from_step = check_is_run_steps_from_scenario_in_file_step,
                             }) => {
        type_mand_checks.is_string_mand(feature_dir, 'feature_dir');
        type_mand_checks.is_string_mand(feature_extension, 'feature_extension');
        type_mand_checks.is_function_mand(get_steps_loc_from_step, 'get_steps_loc_from_step');

        return {
            feature_dir,
            feature_extension,
            get_steps_loc_from_step,
        };
    };

    #merge_gen_feature_opts = (options) => {
        /*Without "bind" class instance "this" will not be attached inside a function*/
        return merge_opts_by_func(options, this.#get_gen_feature_opts.bind(this));
    };

    async gen_features(options) {
        await this.#prepare_data_for_gen(options);

        const {feature_dir, feature_extension} = this.#merge_gen_feature_opts(options);
        const {featuresource_path} = this.#merge_main_opts(options);

        let gen_feature_obj_coll = [];
        for (let trunk of this.#source_path_to_feature_file_data_coll.values()) {
            let file_line_to_str_mgmt_obj = await trunk.file_line_to_str_coll;
            let scenario_name_to_main_data_coll = await trunk.scenario_name_to_main_data_coll;
            for (let scenario_name of scenario_name_to_main_data_coll.keys()) {
                let scenario_str = await this.#generate_steps_string(trunk, scenario_name, options);
                let scenario_main_data = scenario_name_to_main_data_coll.get(scenario_name);
                this.#replace_lines_with_str(
                    scenario_main_data.inner_lines.start,
                    scenario_main_data.inner_lines.end,
                    scenario_str,
                    file_line_to_str_mgmt_obj
                );
            }

            let feature_path = this.#compose_generated_feature_path(
                featuresource_path, trunk.full_path, feature_dir, feature_extension
            );
            let feature_string = this.#convert_lines_to_str(file_line_to_str_mgmt_obj);
            gen_feature_obj_coll.push({feature_path, feature_string});
        }
        await this.#write_feature_files(gen_feature_obj_coll);
    }

    #get_ground_gen_opts = ({
                                create_ground_content_func = create_ground_content,
                                ground_folder_path = path.join(this.featurepart_categories_dir, 'feature_grounds'),
                                get_ground_name_func = (filename) => `GROUND_${filename}`,
                                ground_extension = '.featureground',
                            }) => {
        type_mand_checks.is_function_mand(create_ground_content_func, 'create_ground_content_func');
        type_mand_checks.is_string_mand(ground_folder_path, 'ground_folder_path');
        type_mand_checks.is_function_mand(get_ground_name_func, 'get_ground_name_func');
        type_mand_checks.is_string_mand(ground_extension, 'ground_extension');

        return {
            create_ground_content_func: create_ground_content,
            ground_folder_path,
            get_ground_name_func,
            ground_extension,
        };
    };

    #merge_ground_gen_opts = (options) => {
        /*Without "bind" class instance "this" will not be attached inside a function*/
        return merge_opts_by_func(options, this.#get_ground_gen_opts.bind(this));
    };

    async gen_grounds(options) {
        let trunk_paths = [...(await this.trunk_file_path_to_name).keys()];

        await this.#store_scenario_data_for_files(trunk_paths,
            (path, feature_file_data) => {
                this.#source_path_to_feature_file_data_coll.set(path, feature_file_data);
            });

        let {
            create_ground_content_func,
            ground_folder_path,
            get_ground_name_func,
            ground_extension,
        } = this.#merge_ground_gen_opts(options);

        let {
            featuresource_path,
        } = this.#merge_main_opts(options);

        /*Picking data for generation.*/
        let trunks_data = await Promise.all([...this.#source_path_to_feature_file_data_coll.values()].map(async (trunk) => {
            let scenarios = await trunk.scenario_asts;
            let file_path = await trunk.full_path;
            let file_name = path.parse(file_path).name;

            file_path = path.relative(featuresource_path, file_path);

            return {scenarios, file_path, file_name};
        }));

        await Promise.all(trunks_data.map(async (trunk_data) => {
            let ground_content = create_ground_content_func(trunk_data);
            let ground_file = get_ground_name_func(trunk_data.file_name) + ground_extension;
            let inside_ground_path = path.parse(trunk_data.file_path).dir;

            let ground_path = path.join(ground_folder_path, inside_ground_path, ground_file);

            await fse.outputFile(ground_path, ground_content);
        }));
    }

    #write_feature_files = async (feature_file_obj_coll) => {
        type_mand_checks.is_array_mand(feature_file_obj_coll, 'feature_file_obj_coll');
        await Promise.all(feature_file_obj_coll.map((feature_file_obj) => {
            let {feature_path, feature_string} = feature_file_obj;
            return fse.outputFile(feature_path, feature_string);
        }));
    };

    #compose_generated_feature_path = (source_dir, source_path, feature_dir, feature_extension) => {
        type_mand_checks.is_string_mand(source_dir, 'source_dir');
        type_mand_checks.is_string_mand(source_path, 'source_path');
        type_mand_checks.is_string_mand(feature_dir, 'feature_dir');
        type_mand_checks.is_string_mand(feature_extension, 'feature_extension');

        let source_relative = path.relative(source_dir, source_path);
        let source_relative_path_obj = path.parse(source_relative);
        let source_relative_no_ext = path.join(source_relative_path_obj.dir, source_relative_path_obj.name);

        let feature_relative_path = source_relative_no_ext + feature_extension;
        return path.join(feature_dir, feature_relative_path);
    };

    #replace_lines_with_str = (start_line, end_line, str, line_to_str_mgmt_obj) => {
        /*deleting only lines which begins from first*/
        for (let i = start_line + 1; i < end_line + 1; i++) {
            line_to_str_mgmt_obj.delete(i);
        }
        line_to_str_mgmt_obj.set(start_line, str);
    };

    #convert_lines_to_str = (line_to_str_coll) => {
        let str = '';
        let lines_iterator = line_to_str_coll.keys();
        let lines_amount_except_last = line_to_str_coll.size - 1;
        for (let i = 0; i < lines_amount_except_last; i++) {
            let line = lines_iterator.next().value;
            str += line_to_str_coll.get(line) + os.EOL;
        }
        /*Adding last string without EOL.*/
        str += line_to_str_coll.get(lines_iterator.next().value);

        return str;
    };

    #generate_steps_string = async (feature_file_data, scenario_name, options) => {
        let circ_check = check_circular_seq();

        let {get_steps_loc_from_step} = this.#merge_gen_feature_opts(options);

        let feature_file_data_init = feature_file_data;

        let generate_steps_string = async (feature_file_data, scenario_name) => {
            let scenario_line_to_str_coll = await feature_file_data.get_scenario_line_to_str_coll(scenario_name);
            let main_data_handler = async (step_main_data) => {
                let {result, value} = get_steps_loc_from_step(step_main_data);
                if (result === true) {
                    let {scenario_name, file_name, scenario_str_transformer} = value;
                    let feature_part_full_path = this.part_file_name_to_path_coll.get(file_name);
                    if (feature_part_full_path == null) {
                        throw_err_with_args_print(`Feature part was not found by info provided in step.`,
                            {name: 'scenario_name', value: scenario_name},
                            {name: 'file_name', value: file_name},
                            {name: 'feature part path', value: feature_file_data_init.full_path},
                            {name: 'feature part content', value: await feature_file_data_init.file_content_str, no_val_formatting: true}
                        );
                    }
                    let feature_file_data = this.#part_path_to_feature_file_data_coll.get(feature_part_full_path);
                    /*Delimeter is used for parsing*/
                    let unique_item_str = feature_part_full_path + step_main_data.lines.start.toString();
                    circ_check.validate_seq_item(unique_item_str);

                    let scenario_str = await generate_steps_string(feature_file_data, scenario_name);
                    if (scenario_str_transformer != null) scenario_str = scenario_str_transformer(scenario_str);

                    this.#replace_lines_with_str(step_main_data.lines.start, step_main_data.lines.end, scenario_str, scenario_line_to_str_coll);
                }
            };
            let steps_main_data = (await feature_file_data.scenario_name_to_steps_main_data_coll).get(scenario_name);
            for (let step_main_data of steps_main_data) {
                await main_data_handler(step_main_data);
            }
            return this.#convert_lines_to_str(scenario_line_to_str_coll);
        };
        return await generate_steps_string(feature_file_data, scenario_name);
    };

    //endregion

    //region Prepare data for generation
    #store_scenario_data_for_files = async (file_paths, handler) => {
        type_mand_checks.is_array_mand(file_paths, 'file_paths');
        type_mand_checks.is_function_mand(handler, 'handler');

        let store_scenario_data_base = async (path) => {
            let feature_file_data = new Feature_file_parser(path);
            await feature_file_data.store_scenario_name_to_data();
            handler(path, feature_file_data);
        };
        await Promise.all(file_paths.map((file_path) => store_scenario_data_base(file_path)));
    };

    #prepare_data_for_gen = async (options) => {
        await this.#store_file_path_to_name_data(options);
        let part_paths = [...this.part_file_path_to_name_coll.keys()];
        let trunk_paths = [...this.trunk_file_path_to_name.keys()];

        /*No difference in performance if using "Promise.all() for getting collections"
        * It is because "Promise.all()" is already internally used for each collection.*/
        await this.#store_scenario_data_for_files(part_paths,
            (path, feature_file_data) => {
                this.#part_path_to_feature_file_data_coll.set(path, feature_file_data);
            });
        await this.#store_scenario_data_for_files(trunk_paths,
            (path, feature_file_data) => {
                this.#source_path_to_feature_file_data_coll.set(path, feature_file_data);
            });

        return {
            part_path_to_feature_file_data_coll: this.#part_path_to_feature_file_data_coll,
            source_path_to_feature_file_data_coll: this.#source_path_to_feature_file_data_coll,
        };
    };

    #store_file_path_to_name_data = async (options) => {
        let async_funcs_coll = [
            (options) => this.#store_file_path_and_name_data(options),
            (options) => this.#store_trunk_file_path_to_name(options),
        ];
        await Promise.all(async_funcs_coll.map((async_func) => async_func(options)));
        return true;
    };

    #store_file_path_and_name_data = async (options) => {
        let {featurepart_path, featurepart_patterns} = this.#merge_main_opts(options);

        let handler = (file_path, file_name) => {
            this.#part_file_path_to_name_coll.set(file_path, file_name);
            this.#part_file_name_to_path_coll.set(file_name, file_path);
        };

        await this.#iterate_file_paths(featurepart_path, featurepart_patterns, handler);

        return {
            part_file_path_to_name: this.part_file_path_to_name_coll,
            part_file_name_to_path: this.part_file_name_to_path_coll,
        };
    };

    #store_trunk_file_path_to_name = async (options) => {
        let {featuresource_path, featuresource_patterns} = this.#merge_main_opts(options);

        let handler = (file_path, file_name) => {
            this.#trunk_file_path_to_name.set(file_path, file_name);
        };

        await this.#iterate_file_paths(featuresource_path, featuresource_patterns, handler);

        return {
            trunk_file_path_to_name: this.trunk_file_path_to_name
        };
    };
    //endregion

    //region Manage file paths
    /**
     *
     * @param dir_to_search_full_path
     * @param {Array<String>}pattern_data
     * @returns {Promise<Array<String>>}
     */
    #create_file_paths = async (dir_to_search_full_path, pattern_data) => {
        type_mand_checks.is_string_mand(dir_to_search_full_path, 'dir_to_search_full_path');
        type_mand_checks.is_string_or_array_mand(pattern_data, 'pattern_data');

        /*"pify" module inside "globby" is throwing error, while using pattern_data.
        *Error is caught inside "globby" and it produces correct results.*/
        return await globby(pattern_data, {
            cwd: dir_to_search_full_path,
            dot: true,
            onlyFiles: true,
            absolute: true,
        });
    };

    #iterate_file_paths = async (files_dir, patterns, handler) => {
        type_mand_checks.is_function_mand(handler, 'handler');
        let file_paths = await this.#create_file_paths(files_dir, patterns);
        if (file_paths.length === 0) {
            throw_err_with_args_print('No files found by provided path and patterns.',
                {name: 'files_dir', value: files_dir},
                {name: 'patterns', value: patterns}
            );
        }
        let file_name_coll = [];
        let iterator = (handler) => {
            for (let file_path of file_paths) {
                let file_name = path.parse(file_path).name;
                handler(file_path, file_name);
                file_name_coll.push(file_name);
            }
        };
        iterator(handler);

        /*If collections have different sizes, then some file name was added twice in file_name_coll.
        * Therefore there are duplicated file names*/
        if (new Set(file_name_coll).size !== file_paths.length) {
            let duplicate_file_names = get_duplicates(file_name_coll);
            throw_err_with_args_print('Found non-unique file names. Expected otherwise.',
                {name: 'duplicate_file_names', value: duplicate_file_names},
                {name: 'files_dir', value: files_dir},
                {name: 'patterns', value: patterns},
                {name: 'file_paths', value: file_paths}
            );
        }
    };

    //endregion
}

module.exports = {
    Feature_file_generator: Feature_file_generator,
};

