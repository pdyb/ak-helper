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

function createDiff() {
    log.v("\n开始ak diff...")

    var ak = spawn('ak', argv.nolint ? ['diff', '--nolint', '--reviewers', '瓦雷'] : ['diff', '--reviewers', '瓦雷'], {
        stdio: [process.stdin, process.stdout, process.stderr]
    });

    ak.on('exit', function (code) {
        if (code == 0) {
            githelp.headCommitMsg()
                .then((gitMsgLines) => {
                    githelp.headCommitMsg()
                        .then((gitMsgLines) => {
                            var info = gitMsgLines[4];
                            var revision = gitMsgLines[gitMsgLines.length - 3];
                            log.v(`\n${info}\n ${revision}`);
                        })
                });
        } else {
            log.e("Unexpect!!!")
        }
    });
}

mk.sync()
    .then((statusSummary) => {
        createDiff();
    })