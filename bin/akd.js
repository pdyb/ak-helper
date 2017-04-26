#!/usr/bin/env node

const mk = require("./mkworkbranch.js")
const path = process.cwd();
const git = require('simple-git')(path);
const shell = require("shelljs")
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
const exec = require('child_process').exec;
const log = require("./log.js");

mk.sync()
    .then((statusSummary) => {
        log.v("\n开始ak diff...")

        var ak = spawn('ak', ['diff', '--reviewers', '瓦雷'], {
            stdio: [process.stdin, process.stdout, process.stderr]
        });

        ak.on('exit', function (code) {
            // log.d(data1)

            if (code == 0) {
                log.ok("ak diff 成功");
            } else {
                log.e("Unexpect!!!")
            }
        });
    })