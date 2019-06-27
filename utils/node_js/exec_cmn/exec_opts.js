'use strict';
const async_opts = {
    /*timeout option by default is endless*/
    maxBuffer: 2147483647,
    stdio: 'inherit',
    encoding: 'UTF-8',
};

const sync_opts = {
    maxBuffer: 2147483647,
    encoding: 'UTF-8',
};

module.exports = {
    async_opts,
    sync_opts,
};
