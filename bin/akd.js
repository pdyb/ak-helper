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
const term = require('terminal-kit').terminal;


var people = ['瓦雷', '娄震', '优敏', '工口', '兮乐', '沂风', '豪雄', '苍鸾', '晨暖']

function akdiff() {
    return new Promise((resolve, reject) => {
        log.v("\n开始ak diff...")

        var ak = spawn('ak', argv.nolint ? ['diff', '--nolint', '--reviewers', '瓦雷'] : ['diff', '--reviewers', '瓦雷'], {
            stdio: [process.stdin, process.stdout, process.stderr]
        });

        ak.on('exit', function (code) {
            if (code != 0) {
                log.e("Unexpect!!!")
                reject();
                return;
            }

            githelp.headCommitMsg()
                .then((gitMsgLines) => {
                    var info = gitMsgLines[4];
                    var revision = '';
                    for (line in gitMsgLines) {
                        if (gitMsgLines[line].includes('Revision')) {
                            revision = gitMsgLines[line];
                            break;
                        }
                    }

                    log.v(`\n${info}\n${revision}`);

                    resolve(`${info}\n${revision}`)
                })
        });
    })
}

function selectReviewer(resolve, reject) {
    term.singleColumnMenu(people, [], (error, response) => {
        if (error != undefined) {
            reject(error);
            return;
        }
        // log.dir(response)
        resolve(response.selectedText)
        process.exit();
    })

    term.on('message', (result) => {
        log.ok("ppp-> " + result)
    });
}

mk.sync()
    .then(akdiff)

// selectReviewer((name) => {
//     log.ok('name->' + name)
// })