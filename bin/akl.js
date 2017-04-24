#!/usr/bin/env node

const mk = require("./mkworkbranch.js")
const path = process.cwd();
const git = require('simple-git')(path);
const shell = require("shelljs")
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const log = require("./log.js");

mk.sync()
    .then(() => {
        log.v("\n开始ak land...")

        var ak = spawn('ak', ['land'], {
            stdio: [process.stdin, process.stdout, process.stderr]
        });

        ak.on('exit', function () {
            log.i("ak land 成功，重新创建工作分支\n")

            ak.mk();
        });
    })