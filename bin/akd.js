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


var people = ['瓦雷', '重娄', '优敏', '工口', '兮乐', '沂风', '豪雄', '苍鸾', '晨暖']
var peoplephone = [{
    '瓦雷': '13916459723'
}, {
    '工口': '17195877744'
}, {
    '重娄': '18757556715'
}]

var atPhone = '17195877744'

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
        atPhone = peoplephone[response.selectedText]
        resolve(response.selectedText)
        process.exit();
    })
}

// function askPost2DingDing(msg) {
//     return new Promise((resolve, reject) => {})
// }

function post2DingDing(msg) {
    var https = require('https');
    var url = require('url');
    var querystring = require('querystring');

    var postData = JSON.stringify({
        "msgtype": "text",
        "text": {
            "content": msg
        },
        "at": {
            "atMobiles": [
                atPhone
            ],
            "isAtAll": false
        }
    })

    var options = {
        hostname: 'oapi.dingtalk.com',
        port: 443,
        path: '/robot/send?access_token=6737639fcc6431c0de0d7e6f35fe342526983bb31eb675e53a2d28e68c943254',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    var req = https.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            // console.log('BODY: ' + chunk);
            log.ok('发送到钉钉ok')
        });
    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(postData);
    req.end();
}

// post2DingDing('21231');

mk.sync()
    .then(akdiff)
    // .then(post2DingDing)

