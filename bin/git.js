#!/usr/bin/env node

const spawnSync = require('child_process').spawnSync;

module.exports = () => {
    return {
        /**
         * 获取当前分支名
         */
        currentBranchName: ()=> {
            var result = spawnSync('git', ['branch'], {
                encoding: 'utf8'
            });

            var branch = "";

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
        }
    }
}