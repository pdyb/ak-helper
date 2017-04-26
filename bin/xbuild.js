#!/usr/bin/env node
const log = require("./log.js");

var argv = require('yargs')
    .alias('c', 'clean')
    .alias('f', "fast")
    .alias('h', 'help')
    .alias('i', 'install')
    .alias('r', 'release')
    .argv;
var colors = require('colors');
const shell = require('shelljs');


// console.log(argv.clean)
// console.log(argv.fast)
// console.log(argv.install)


var clean = argv.clean ? " clean " : "";
var fast = argv.fast ? " -PminiSdkVersion=21 -Dmtl.tBuildConfig.mergeOverride=false -Dmtl.tBuildConfig.postHandleBundles=false " : "";
var release = argv.release ? "assembleRelease" : "assembleDebug";

var build_cmd = `./gradlew ${clean} ${release}  ${fast}`;

if (fast) {
    log.w("WARNING: fast build开启，如果安装到5.0以下手机，会出现 包解析出错")
}

log.i(build_cmd);

var build = shell.exec(build_cmd);
if (build.code == 0) {
    log.ok("\nbuild success at " + ` ${new Date().toLocaleTimeString()} `.black.bgGreen + "\n\n");
    if (argv.i) {
        shell.exec("xreinstall . -f");
    }
} else {
    log.e("\nbuild failed: " + build_cmd);
}