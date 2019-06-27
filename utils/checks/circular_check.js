'use strict';
//Local utils
let {throw_err_with_args_print} = require('../errors/custom_errors');
let type_mand_checks = require('../checks/type_mand_checks');

const check_circ_dflts = {
    call_repeats_chain: 0,
    delimiter: ';',
    amount_modifier: 1,

    find_in_str: '',
    find_in_dflt_qty: 5,
    find_in_curr_qty: 0,

    search_for_str: '',
    search_for_dflt_qty: 3,
    search_for_curr_qty: 0,
    search_for_extra_qty_curr: 0,
};
const check_circular_seq = () => ({
    used: new Set(),
    call_repeats_chain: check_circ_dflts.call_repeats_chain,
    delimiter: check_circ_dflts.delimiter,
    amount_modifier: check_circ_dflts.amount_modifier,
    find_in_str: check_circ_dflts.find_in_str,
    /*Search unique items should be always more than compare.
    * It is because we are looking for compare items in search items.*/
    find_in_dflt_qty: check_circ_dflts.find_in_dflt_qty,
    find_in_curr_qty: check_circ_dflts.find_in_curr_qty,
    search_for_str: check_circ_dflts.search_for_str,
    search_for_dflt_qty: check_circ_dflts.search_for_dflt_qty,
    search_for_curr_qty: check_circ_dflts.search_for_curr_qty,
    search_for_extra_qty_curr: check_circ_dflts.search_for_extra_qty_curr,

    validate_seq_item(unique_item_str) {
        type_mand_checks.is_string_mand(unique_item_str, 'unique_item_str');
        let unique_item_w_delimiter = unique_item_str + this.delimiter;

        if (this.used.has(unique_item_w_delimiter) === true) {
            this.call_repeats_chain++;
            let search_qty = this.find_in_dflt_qty * this.amount_modifier;
            let compare_qty = this.search_for_dflt_qty * this.amount_modifier + this.search_for_extra_qty_curr;
            /*Loading items to compare with available ones for search.
            * Comparing items right after searching them.
            * In case it is circular sequence, compared items will be present in searched ones.*/
            if (search_qty > this.find_in_curr_qty) {
                this.find_in_str += unique_item_w_delimiter;
                this.find_in_curr_qty++;
            }
            else if (compare_qty > this.search_for_curr_qty) {
                this.search_for_str += unique_item_w_delimiter;
                this.search_for_curr_qty++;
            }

            if (compare_qty === this.search_for_curr_qty) {
                let parts_between_matches = this.find_in_str.split(this.search_for_str);
                let parts_between_matches_length = parts_between_matches.length;
                /* If there is only item in arr, then no matches found*/
                if (parts_between_matches_length > 1) {
                    let items_after_last_match = parts_between_matches[parts_between_matches_length - 1];
                    if (items_after_last_match === '') {
                        /*Preparing info for error*/
                        let strings = this.search_for_str.split(this.delimiter);
                        strings.splice(strings.length - 1, 1);
                        throw_err_with_args_print('Found circular sequence.',
                            {name: 'circular sequence of items', value: strings}
                        );
                    }
                    else {
                        let items_after_last_match_wo_ending = items_after_last_match.slice(0, items_after_last_match.length - 1);
                        this.search_for_extra_qty_curr += items_after_last_match_wo_ending.split(this.delimiter).length;
                    }
                }
                else {
                    /*In case no matches for circular sequence found, but items are still repeating increasing search items and making reset for compare ones.
                    * This helps to find circular sequence faster*/
                    this.find_in_str += this.search_for_str;
                    this.find_in_curr_qty += this.search_for_curr_qty;
                    this.search_for_str = '';
                    this.search_for_curr_qty = 0;
                    this.search_for_extra_qty_curr = 0;
                    this.amount_modifier *= 2;
                }
            }
        }
        else {
            /*Unique item found, therefore chain is broken.*/
            this.used.add(unique_item_w_delimiter);
            /*Resetting everything to defaults in case new unique item found.
            * This improves performance.*/
            this.call_repeats_chain = 0;
            this.amount_modifier = 1;
            this.find_in_curr_qty = 0;
            this.search_for_curr_qty = 0;
            this.search_for_extra_qty_curr = 0;
            this.find_in_str = '';
            this.search_for_str = '';
        }
    }
});

module.exports = {
    check_circular_seq: check_circular_seq,
};
