'use strict';
//Modules
const _object = require('lodash/object');
const _lang = require('lodash/lang');
//Local utils
const {merge_opts_by_func} = require('../../utils/object/merge_options');

const get_map_explore_deep_opts = ({
                                       iteratee_explore = () => true,
                                       iteratee_explore_replaced = () => false,
                                       after_acc_explored_hook = null,
                                   }) => {
    return {
        iteratee_explore,
        iteratee_explore_replaced,
        after_acc_explored_hook,
    };
};

/**
 *
 * @param object
 * @param iteratee_replace
 * @param options
 * @returns {*}
 */
function map_explore_deep(object, iteratee_replace, options) {
    let merged_objs = merge_opts_by_func(options, get_map_explore_deep_opts);
    let {
        iteratee_explore,
        iteratee_explore_replaced,
        after_acc_explored_hook,
    } = merged_objs;

    let transform_recursively = (object_recurse, iteratee_replace_recurse) => {
        return _object.transform(object_recurse, (acc, value, key) => {
            const replacement_obj = iteratee_replace_recurse(value, key, object_recurse);

            if (replacement_obj == null
                /*Result property should be boolean.*/
                || typeof replacement_obj.result !== 'boolean'
                /*If result is true, property "value" should be present.*/
                || (replacement_obj.result === true && replacement_obj.hasOwnProperty('value') === false)
            ) {
                throw new Error(`"replacement_obj" argument is not a object with properties: result - mandatory, value - mandatory, if result is true. Expected otherwise.
Argument "replacement_obj" has value:
${stringify_val_for_print(replacement_obj)}.`);
            }

            let exploring_inside = iteratee_explore(value, key, object_recurse);
            if (typeof exploring_inside !== 'boolean') {
                throw new Error(`"exploring_inside" argument is not a Boolean. Expected boolean only.
Argument "exploring_inside" has value:
${stringify_val_for_print(exploring_inside)}.`);
            }

            const {result: is_replaced, value: replaced_value} = replacement_obj;

            let value_result;
            if (is_replaced === true) {
                value_result = replaced_value;

                let exploring_inside_replaced = iteratee_explore_replaced(replaced_value, key, object_recurse, value);
                if (typeof exploring_inside_replaced !== 'boolean') {
                    throw new Error(`"exploring_inside_replaced" argument is not a Boolean. Expected boolean only.
Argument "exploring_inside_replaced" has value:
${stringify_val_for_print(exploring_inside_replaced)}.`);
                }

                /*Updating exploring_inside value according to settings for replaced value.*/
                (exploring_inside_replaced === false) ? exploring_inside = false : exploring_inside = true;
            }
            else {
                value_result = value;
            }
            let is_explorable_type = _lang.isPlainObject(value_result) || Array.isArray(value_result);
            if (exploring_inside === true && is_explorable_type === true) {
                acc[key] = transform_recursively(value_result, iteratee_replace_recurse, iteratee_explore);
            }
            else {
                /*Key always need to me added to acc, because it is new object.*/
                acc[key] = value_result;
            }

            if (after_acc_explored_hook != null) {
                /*Returning only acc and key, because only them are actual after value transformation.*/
                return after_acc_explored_hook(acc, key);
            }
            return acc;
        });
    };
    return transform_recursively(object, iteratee_replace);
}

module.exports = {
    map_explore_deep,
};


