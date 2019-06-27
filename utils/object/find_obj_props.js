'use strict';
//Modules
const _object = require('lodash/object');
const _lang = require('lodash/lang');
//Local utils
let {get_var_name} = require('../../utils/errors/error_info');

let prop_not_found_val_dflt = null;


function get_obj_prop_by_exg_path(obj, path_str, prop_not_found_val = prop_not_found_val_dflt) {
    let prop_by_path = _object.get(obj, path_str, prop_not_found_val);

    /*
     * Using "_lang.isEqual" because objects can be used as defaults*/
    let prop_val_is_dflt_val = _lang.isEqual(prop_by_path, prop_not_found_val);
    if (prop_val_is_dflt_val) {
        throw new Error(`Object property by parameter ${get_var_name({path_str})} has value for not found property. Please check the ${get_var_name({path_str})} and value for not found property.`);
    }

    return prop_by_path;
}

module.exports = {
    get_obj_prop_by_exg_path: get_obj_prop_by_exg_path,
    prop_not_found_val_dflt: prop_not_found_val_dflt,
};
