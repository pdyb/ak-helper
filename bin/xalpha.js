#!/usr/bin/env node
const log = require("./log.js");
var argv = require('yargs').argv;


var percent_2_hex = (percent)=> {
    return parseInt(255 * percent / 100).toString(16).toUpperCase();
}

if (!argv._ == '') {
    log.ok('hex is ' + percent_2_hex(argv._));
}