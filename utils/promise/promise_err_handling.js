'use strict';
//Local utils
const {stringify_val_for_print} = require('../../utils/node_js/util/inspect');

function reject_with_error(error, msg_before_error) {
    let message = stringify_val_for_print(error, {max_lines_length: 300});

    if (msg_before_error != null) {
        if (typeof msg_before_error !== 'string') {
            throw new Error(`Internal error. Message before error is not a string. Expected only strings. 
The value of the message before error:
${stringify_val_for_print(msg_before_error, {max_lines_length: 300})}`);
        }
        message = msg_before_error + message;
    }

    return Promise.reject(new Error(message));
}

module.exports = {
    reject_with_error: reject_with_error,
};
