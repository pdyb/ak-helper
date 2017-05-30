#!/usr/bin/env node

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

var logi = (msg) => {
    console.log(colors.cyan(msg));
};

var logw = (msg) => {
    console.log(colors.yellow(msg));
};

var loge = (msg) => {
    console.log(colors.red(msg));
};

var logok = (msg) => {
    console.log(colors.green(msg));
};

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
        loge("can not found adb, please check");
        process.exit(1);
    }

    logi("wait adb device...")
    shell.exec("adb wait-for-device");
    logi("divice connected")

    // console.log(shell.exec("which adb").code == 0);
}

function listApkIn(dir) {
    logi(`search dir:${DIR} \n`)
    var apks = [];
    shell.find(dir)
        .filter((file) => {
            return String(file).endsWith(".apk");
        })
        .sort((a, b) => {
            return fs.lstatSync(a).mtime - fs.lstatSync(b).mtime < 0;
        })
        .forEach((file, i) => {
            apks[i] = file;
        });

    if (apks.length <= 0) {
        loge("no apk found in " + dir)
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

    logi(`found this:\n------------------------------------------`);
    apklist.forEach((item, i) => {
        logi("| " + i + " |  " + item)
    });
    logi("------------------------------------------\n");

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
    logi(`sending ${file} ... `);

    execSilent(`adb push "${file}" /data/local/tmp/"${packagename}"`);
    execSilent(`adb shell am force-stop "${packagename}"`);

    logi("install apk...");

    var installCmd = `adb shell pm install -r /data/local/tmp/${packagename}`;
    var firstInstall = shell.exec(installCmd);

    var failed = firstInstall === undefined || firstInstall.stdout.split('\n')[1] == undefined || firstInstall.stdout.split('\n')[1].indexOf("Success") != 0;

    if (failed) {
        loge("install failed。 try uninstall old apk first ...")

        var uninsallOldCmd = `adb shell pm uninstall ${packagename}`

        logi("install apk...");

        shell.exec(uninsallOldCmd)
        shell.exec(installCmd);
    } else {
        logok("\nsuccess");
    }

    autoLaunchApp(packagename)
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