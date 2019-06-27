'use strict';

function set_only_opts_from_cli(obj, cli_inst) {
    for (let option of cli_inst.options) {
        let option_name = option.long.slice(2);
        /*Adding option only if it is not default "version" option.*/
        if (option_name !== 'version') {
            obj[option_name] = cli_inst[option_name];
        }
    }

    return obj;
}

module.exports = {
    set_only_opts_from_cli,
};
