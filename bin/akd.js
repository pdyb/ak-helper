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
        log.v("\n开始ak diff...")

        var ak = spawn('ak', ['diff', '--reviewers', '工口'], {
            stdio: [process.stdin, process.stdout, process.stderr]
        });

        var data1;
        ak.on('data', (data) => {
            data1 = data;
        });

        ak.on('exit', function () {
            log.i("exit ak" + data1)
        });
    })