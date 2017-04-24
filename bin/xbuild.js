#!/usr/bin/env node

var argv = require('yargs')
    .alias('c', 'clean')
    .alias('f', "fast")
    .alias('h', 'help')
    .alias('i', 'install')
    .argv;
var colors = require('colors');
const shell = require('shelljs');


// console.log(argv.clean)
// console.log(argv.fast)
// console.log(argv.install)


var clean = argv.clean ? " clean " : "";
var fast = argv.fast ? " -PminiSdkVersion=21 -Dmtl.tBuildConfig.mergeOverride=false -Dmtl.tBuildConfig.postHandleBundles=false " : "";

var build_cmd = `./gradlew ${clean} assembleDebug  ${fast}`;

console.log(colors.yellow(build_cmd));

var build = shell.exec(build_cmd);
if (build.code == 0) {
    console.log(colors.green("\nbuild success at " + ` ${new Date().toLocaleTimeString()} `.black.bgGreen) + "\n\n");
    if (argv.i) {
        shell.exec("xreinstall . -f");
    }
} else {
    console.log(colors.red("\nbuild failed: " + build_cmd));
}