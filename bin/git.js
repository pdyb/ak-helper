#!/usr/bin/env node
var colors = require('colors');
const spawnSync = require('child_process').spawnSync;

function abortWhenErr(cmdResult, msg) {
    var err = cmdResult.stderr;
    if (err) {
        console.log(colors.red(msg));

        throw err;
    }
}

module.exports = () => {
    return {
        checkGitExist: ()=> {

        },

        /**
         * 获取当前分支名
         */
        currentBranchName: () => {
            var result = spawnSync('git', ['branch'], {
                encoding: 'utf8'
            });

            var branchName = "";

            result.stdout
                .toString()
                .trim()
                .split('\n')
                .forEach(function(v, i) {
                    var trimV = v.trim();
                    if (trimV.indexOf("*") != -1) {
                        branchName = trimV.substring(2);
                    }
                });

            return branchName;
        },

        /**
         * 是否有修改记录。 true表示有
         */
        isDirty: () => {
            var result = spawnSync('git', ['diff', '--shortstat'], {
                encoding: 'utf8'
            });


            return result.stdout.toString().trim().length > 0;
        },

        checkoutBranch: (branchName, errMsg) => {
            abortWhenErr(spawnSync('git', ['checkout', '-b', branchName]), errMsg);
        },

        /**
         * 暂存
         */
        stash: (msg) => {
            abortWhenErr(spawnSync('git', ['stash', 'save', msg]), "git stash 出错了");
        },

        /**
         * 暂存提取
         */
        stashApply: (errMsg) => {
            abortWhenErr(spawnSync('git', ['stash', 'apply', 'stash@{0}']), errMsg);
        },


    }
}