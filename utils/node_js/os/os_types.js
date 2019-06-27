const os = require('os');

/**
 *
 * @returns {boolean}
 */
function is_windows_check() {
    return os.type().toLowerCase().includes('windows');
}

function is_mac_check() {
    return os.type().toLowerCase().includes('darwin');
}


module.exports = {
    is_windows_check,
    is_mac_check,
};