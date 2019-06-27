'use strict';
// Modules
const {execFile} = require('child_process');
const {execFileSync} = require('child_process');
//Local utils
const {async_opts, sync_opts} = require('../exec_cmn/exec_opts');
const type_mand_checks = require('../../../utils/checks/type_mand_checks');
const {merge_opts_by_func} = require('../../../utils/object/merge_options');
const {reject_with_error} = require('../../../utils/promise/promise_err_handling');
const {stringify_val_for_print} = require('../../../utils/node_js/util/inspect');
//Promisify
const exec_file_promise = (file, args, options, process_handler) => {
    return new Promise((resolve, reject) => {
        let run_cb = () => execFile(file, args, options, (error, stdout, stderr) => {
            if (error != null) {
                /*Passing custom properties on reject.
                * By default is an object passed on reject it is not considered as error.*/
                error.custom_properties = {stdout, stderr};
                return reject(error);
            }
            return resolve({stdout, stderr});
        });
        if (process_handler != null) {
            return process_handler(run_cb());
        }
        else {
            return run_cb();
        }
    });
};

function cut_rejected_custom_properties(rejected) {
    let rejected_properties = rejected.custom_properties;
    /*As for node.js v10.15 need to delete any custom properties from object
    * to prevent output of the properties in error.*/
    delete rejected.custom_properties;
    return rejected_properties;
}

const exec_file_async_opts = ({
                                  node_opts = async_opts,
                                  process_handler = null,
                                  error_handler = (rejected) => {
                                      let custom_properties = cut_rejected_custom_properties(rejected);
                                      return reject_with_error(rejected, '\n' + custom_properties.stdout + custom_properties.stderr);
                                  },
                              } = {}) => {
    if (error_handler != null) type_mand_checks.is_function_mand(error_handler, 'error_handler');

    return {
        node_opts,
        process_handler,
        error_handler,
    };
};
/**
 *
 * @param {String} file_name
 * @param {Array} cmd_parts
 * @param {Object | Null} [options]
 * @param options.node_opts
 * @param options.get_exec_cb_func
 * @returns {Promise<{stdout:String,stderr:String}>}
 */

async function exec_file_cmn(file_name, cmd_parts, options) {
    let merged_opts = merge_opts_by_func(options, exec_file_async_opts);
    let {
        node_opts,
        process_handler,
        error_handler,
    } = merged_opts;

    type_mand_checks.is_string_mand(file_name, 'file_name');
    type_mand_checks.is_array_mand(cmd_parts, 'cmd_parts');

    return await exec_file_promise(file_name, cmd_parts, node_opts, process_handler).catch((rejected) => {
        if (error_handler != null) return error_handler(rejected);

        let {stderr, stdout} = cut_rejected_custom_properties(rejected);

        return {error: rejected, stderr, stdout};
    });
}

const exec_file_sync_opts = ({
                                 node_opts = sync_opts,
                                 error_handler = (error) => {
                                     let error_msg = '\n'
                                         + error.stdout
                                         + error.stderr
                                         + stringify_val_for_print(error, {max_lines_length: 300});
                                     throw new Error(error_msg);
                                 },
                             } = {}) => {
    if (error_handler != null) type_mand_checks.is_function_mand(error_handler, 'error_handler');

    return {
        node_opts,
        error_handler,
    };
};

function exec_file_cmn_sync(file_name, cmd_parts, options) {
    let merged_opts = merge_opts_by_func(options, exec_file_sync_opts);
    let {
        node_opts,
        error_handler,
    } = merged_opts;

    type_mand_checks.is_string_mand(file_name, 'file_name');
    type_mand_checks.is_array_mand(cmd_parts, 'cmd_parts');

    let output;
    try {
        output = execFileSync(file_name, cmd_parts, node_opts);
    }
    catch (error) {
        error_handler(error);
        return {error, stdout: error.stdout, stderr: error.stderr};
    }

    return {stdout: output};
}

module.exports = {
    exec_file_cmn,
    exec_file_cmn_sync,
};
