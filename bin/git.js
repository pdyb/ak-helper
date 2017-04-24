#!/usr/bin/env node

const Promise = require("bluebird");
const colors = require('colors');
const shell = require('shelljs');
const spawnSync = require('child_process').spawnSync;
const path = process.cwd();
const git = require('simple-git')(path);
const log = require("./log.js");

var getCurrentBranchName = () => {
    return new Promise((resolve, reject) => {
        git.branchLocal((err, result) => {
            var branchName = result.current;
            // log.i("branchLocal = " + branchName)
            resolve(branchName);
        })
    });
}

var abortWhenGitNotExist = () => {
    return new Promise((resolve, reject) => {
        if (!shell.which("git")) {
            log.e("未找到git，请检查是否已经安装git")
            process.exit(1);
        }

        if (!shell.which("ak")) {
            log.e("未找到ak，请检查是否已经安装ak")
            process.exit(1);
        }

        git.status((err) => {
            if (err) {
                log.e("error:当前目录不是git仓库，请检查工作目录")
                process.exit(1);
            }
            resolve(true);
        })
    });
}

/**
 * 判断当前repo是否有修改文件。
 */
var checkModifyFiles = () => {
    return new Promise((resolve, reject) => {
        git.diff(['--numstat'], (err, result) => {
            var isDirty = result.toString().trim().length > 0;

            if (isDirty) {
                log.e("\n" + result)
            }

            // log.i("checkRepoDirty " + result + ",  isDirty=" + isDirty);
            resolve(result.toString().trim().length > 0);
        })
    });
}

/**
 * 检测repo是clean的
 */
var checkRepoClean = () => {
    return new Promise((resolve, reject) => {
        abortWhenGitNotExist()
            .then(checkModifyFiles)
            .then(
                (hasModify) => {
                    // log.i("checkEnv dirty = " + isDirty)
                    if (hasModify) {
                        reject("当前目录有未提交的文件");
                    }

                    resolve("ok");
                }
            );
    });
}

/**
 * 引导stash
 * @param {*} tip 引导
 */
var askStash = (tip) => {
    return new Promise((resolve, reject) => {
        log.question(tip, (answer) => {
            if (answer != 'y' && answer != 'Y') {
                reject();
                return;
            }

            git
                .add(".")
                .stash(() => {
                    log.ok("stash success")
                    log.v("\n");

                    resolve();
                });
        });
    });
}

module.exports = {
    checkRepoClean: checkRepoClean,
    getCurrentBranchName: getCurrentBranchName,
    abortWhenGitNotExist: abortWhenGitNotExist,
    checkModifyFiles: checkModifyFiles,
    askStash: askStash
}