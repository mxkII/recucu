'use strict';
//Modules
const JSON5 = require('json5');
const _object = require('lodash/object');
const _lang = require('lodash/lang');

function merge_object_with_json_str(json_str, obj) {
    let json_obj = JSON5.parse(json_str);
    return _object.defaultsDeep({}, json_obj, obj);
}

/**
 * Function is intended to optimize performance for cases, when value is not an object
 * @param {*} val
 * @return {*}
 */
function clone_deep(val) {
    //making pre-check for object types (object, array, map, etc.) to make method performance effective (if not an object than no need to do other checks)
    if (typeof val === "object") {
        //receiving full object type
        let object_type = Object.prototype.toString.call(val);
        //if primitive type was created with not recommended "new" constructor like "new Boolean(true)", just add it to object. The same applies to Null object, cause it is immutable (has no connections if copied directly)
        switch (object_type) {
            case "[object Null]":
            case "[object Number]":
            case "[object String]":
            case "[object Boolean]":
                return val;
            // if it is some other object type deeply clone it. Also making sure there will be no dependencies between new and original objects with the help of deep cloning.
            default:
                return _lang.cloneDeep(val);
        }
    }
    else {
        return val;
    }
}

module.exports = {
    clone_deep: clone_deep,
    merge_object_with_json_str: merge_object_with_json_str,
};