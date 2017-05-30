#!/usr/bin/env node

const mk = require("./mkworkbranch.js")
const path = process.cwd();
const shell = require("shelljs")
const spawn = require('child_process').spawn;
const log = require("./log.js");
const githelp = require("./git.js")
const argv = require('yargs')
    .alias('n', 'nolint')
    .argv;

mk.sync()
    .then((statusSummary) => {
        log.v("\n开始ak diff...")

        // var nolint = argv.nolint ? "--nolint" : "";

        var ak = spawn('ak', argv.nolint ? ['diff', '--nolint' , '--reviewers', '瓦雷'] : ['diff', '--reviewers', '瓦雷'], {
            stdio: [process.stdin, process.stdout, process.stderr]
        });

        ak.on('exit', function (code) {
            // log.d(data1)

            if (code == 0) {
                // log.ok("ak diff 成功");

                githelp.headCommitMsg()
                    .then((msg) => {
                        log.i(`\n${msg}\n`);
                    })
            } else {
                log.e("Unexpect!!!")
            }
        });
    })