'use strict';
// Modules
const {exec} = require('child_process');
//Local utils
const {async_opts, sync_opts} = require('../exec_cmn/exec_opts');
const type_mand_checks = require('../../../utils/checks/type_mand_checks');
const {merge_opts_by_func} = require('../../../utils/object/merge_options');
const {reject_with_error} = require('../../../utils/promise/promise_err_handling');
//Promisify
const exec_promise = (command, options, process_handler) => {
    return new Promise((resolve, reject) => {
        let run_cb = () => exec(command, options, (err, stdout, stderr) => {
            if (err != null && process_handler != null) return reject(err);
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

const exec_file_opts = ({
                            node_opts = async_opts,
                            process_handler = null,
                            error_handler = (error) => reject_with_error(error),
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
 * @param {String} cmd
 * @param {Object | Null} [options]
 * @param options.node_opts
 * @param options.get_exec_cb_func
 * @returns {Promise<{stdout:String,stderr:String}>}
 */

async function exec_cmn(cmd, options) {
    let merged_opts = merge_opts_by_func(options, exec_file_opts);
    let {
        node_opts,
        process_handler,
        error_handler,
    } = merged_opts;

    type_mand_checks.is_string_mand(cmd, 'cmd');

    return await exec_promise(cmd, node_opts, process_handler).catch((error) => {
        if (error_handler != null) error_handler(error);
    });
}

module.exports = {
    exec_cmn: exec_cmn,
};
