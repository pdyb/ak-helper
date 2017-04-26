#!/usr/bin/env node

const Promise = require("bluebird");
const colors = require('colors');
const shell = require('shelljs');
const spawnSync = require('child_process').spawnSync;
const path = process.cwd();
const git = require('simple-git')(path);
const log = require("./log.js");

var gitStatus = () => {
    return new Promise((resolve, reject) => {

        // log.i("git.status begin ======")
        git
            .outputHandler(function (command, stdout, stderr) {
                stdout = null;
                stderr = null;
            })
            .status((err, statusSummary) => {
                // log.i("=====git.status end")
                if (err) {
                    reject("error when get local branch name");
                    log.e("error:当前目录不是git仓库，请检查工作目录")
                    process.exit(1);
                    return;
                }

                statusSummary.isDirty = () => {
                    return this.files.length != 0;
                };

                // log.dir(statusSummary)
                resolve(statusSummary);
            })
    });
}

var pull = (branch) => {
    return new Promise((resolve, reject) => {
        log.v("同步" + branch + "分支代码到最新..")

        git
            .outputHandler(function (command, stdout, stderr) {
                stdout.pipe(process.stdout);
                stderr.pipe(process.stderr);
            })
            .pull({
                '--rebase': 'true'
            }, (err, update) => {
                resolve();
            })
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
    status: gitStatus,
    askStash: askStash,
    pull: pull
}