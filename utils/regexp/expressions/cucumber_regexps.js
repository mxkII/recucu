'use strict';
const scenario_init_str = ' *Scenario(| Outline):.*';
const scenario_init = new RegExp(scenario_init_str);

module.exports = {
    scenario_init_str,
    scenario_init,
};
