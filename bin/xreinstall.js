#!/usr/bin/env node

const log = require("./log.js");
const fs = require('fs');
const colors = require('colors');
const shell = require('shelljs');
const readline = require('readline');
const argv = require('yargs')
    .usage('Usage: $0 [dir]')
    .help('h')
    .alias('h', 'help')
    .example('$0 .', '   choose apk in the given dir to install')
    .example('$0', '   choose apk in the ~/Downloads dir to install')
    .alias('f', 'first')
    .argv;

var DIR = argv._.length == 0 ? "/Users/xiaoxinpeng/Downloads/" : argv._[0];

function question(tip, action) {
    const rl = readline
        .createInterface({
            input: process.stdin,
            output: process.stdout
        });
    rl.question(tip, (answer) => {
        action(answer);
        rl.close();
    });
}

function checkDeviceConnect() {
    if (execSilent("which adb").code != 0) {
        log.e("can not found adb, please check");
        process.exit(1);
    }

    log.v("wait adb device...")
    shell.exec("adb wait-for-device");
    log.v("divice connected")

    // console.log(shell.exec("which adb").code == 0);
}

function listApkIn(dir) {
    log.v(`search dir:${DIR} \n`)
    var apks = [];
    shell.find(dir)
        .filter((file) => {
            return String(file).endsWith(".apk");
        })
        .sort((a, b) => {
            // log.i(a + fs.lstatSync(a).atime.getTime() + "  " + b + fs.lstatSync(b).atime.getTime())
            return fs.lstatSync(a).mtime.getTime() - fs.lstatSync(b).mtime.getTime() < 0;
        })
        .forEach((file, i) => {
            apks[i] = file;
        });

    if (apks.length <= 0) {
        log.e("no apk found in " + dir)
        shell.exit(0)
        return;
    }

    return apks;
}

function execSilent(cmd) {
    return shell.exec(cmd, {
        silent: true
    })
}

/**
 * 从目录列表中选择一个
 */
function chooseOneApk(dir, action) {
    execSilent("clear");

    var apklist = listApkIn(dir);

    log.v(`found this:\n------------------------------------------`);
    apklist.forEach((item, i) => {
        log.v("| " + i + " |  " + item)
    });
    log.v("------------------------------------------\n");

    if (argv.f) {
        action(apklist[0]);
        return;
    }

    question("choose one to install(empty for the 0th): ", (answer) => {
        var index = answer == '' || answer > apklist.length || answer < 0 ? 0 : answer;
        action(apklist[index])
    });
}

/**
 * 安装
 */
function installApk(file) {
    var packagename = getPackageName(file);
    log.v(`sending ${file} ... `);

    execSilent(`adb push "${file}" /data/local/tmp/"${packagename}"`);
    execSilent(`adb shell am force-stop "${packagename}"`);

    log.v("install apk...");

    var installCmd = `adb shell pm install -r /data/local/tmp/${packagename}`;
    shell.exec(installCmd, (err, stdout, stderr) => {
        if (err) {
            log.e("install failed。 try uninstall old apk first ...")
            var uninsallOldCmd = `adb shell pm uninstall ${packagename}`
            log.v("install apk...");
            shell.exec(uninsallOldCmd)
            shell.exec(installCmd);
        } else {
            log.ok("\nsuccess");
        }

        autoLaunchApp(packagename)
    });
}


function getPackageName(file) {
    var packagename = '';

    var dump = execSilent("aapt d badging " + file);
    dump.split('\n').forEach((line, i) => {
        if (line.startsWith('package: name=')) {
            line.split(" ").forEach((part, i) => {
                if (part.startsWith("name")) {
                    packagename = part.substring(6, part.length - 1);
                }
            });
        }
    });

    return packagename;
}

function autoLaunchApp(packagename) {
    // var lunchcmd = `adb shell am start ${packagename} `;
    execSilent(`adb shell am start  -n "fm.xiami.main/fm.xiami.main.SplashActivity" -a android.intent.action.MAIN -c android.intent.category.LAUNCHER`);
    console.log(colors.green("\install success at " + ` ${new Date().toLocaleTimeString()} `.black.bgGreen) + "\n\n");
}

checkDeviceConnect();
// console.log(argv._[0])
chooseOneApk(DIR, (file) => {
    installApk(file);
});