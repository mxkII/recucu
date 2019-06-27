'use strict';
//Modules
const os = require('os');
const pkgDir = require('pkg-dir');
const app_root_string = pkgDir.sync();
const path = require('path');
//Local utils
const {join_arr} = require('../../../utils/collections/array/concat_data_in_array');
const type_mand_checks = require('../../checks/type_mand_checks');

function get_absolute_path(root_or_absolute_path) {
    type_mand_checks.is_string_mand(root_or_absolute_path, Object.keys({root_or_absolute_path})[0]);

    let path_trimmed = root_or_absolute_path.trim();

    let root_check_syms_qty = 2;
    let path_syms_for_root_check = path_trimmed.slice(0, root_check_syms_qty);
    let path_syms_wo_root_check = path_trimmed.slice(root_check_syms_qty);

    //checking is it a relative path from root or absolute path
    if (path_syms_for_root_check === './') {
        return path.join(app_root_string, path_syms_wo_root_check);
    }
    else {
        return path_trimmed;
    }
}

function convert_path_to_os_valid(relative_path, os_type = os.type()) {
    let is_windows_path = relative_path.includes('\\');
    let is_windows_os = os_type.toLowerCase().includes('windows');
    if (is_windows_os === true && is_windows_path === false) {
        return join_arr(relative_path.split('/'), '\\\\');
    }
    else if (is_windows_os === false && is_windows_path === true) {
        return join_arr(relative_path.split('\\'), '/');
    }
    /*If path type matches current os, just return path.*/
    else {
        return relative_path;
    }
}

function get_path_with_no_extension(value) {
    let parsed_path = path.parse(value);
    return path.join(parsed_path.dir, parsed_path.name);
}

module.exports = {
    get_absolute_path: get_absolute_path,
    convert_path_to_os_valid: convert_path_to_os_valid,
    get_path_with_no_extension: get_path_with_no_extension,
};
