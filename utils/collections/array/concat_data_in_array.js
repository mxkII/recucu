'use strict';
/**
 * Function has a better performance than "Array.prototype.join()".
 * As for node.js 10.12.
 * @memberOf misc_js_utils
 * @param {Array.<String>}str_coll
 * @param {String} [separator]
 */
function join_arr(str_coll, separator) {
    let joined_str = '';
    let str_arr_length = str_coll.length;
    if (str_arr_length === 0) return '';
    /*If there is no separator just concat string one by one.*/
    if (separator == null) {
        for (let i = 0; i < str_arr_length; i++) {
            joined_str = joined_str + str_coll[i];
        }
    }
    /*If there is some separator use it between string items in array.*/
    else {
        for (let i = 0; i < str_arr_length - 1; i++) {
            joined_str = joined_str + str_coll[i] + separator;
        }
        /*Last idx goes without separator at the end.*/
        joined_str = joined_str + str_coll[str_arr_length - 1];
    }

    return joined_str;
}

module.exports = {
    join_arr: join_arr,
};


