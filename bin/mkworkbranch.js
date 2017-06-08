#!/usr/bin/env node

const log = require("./log.js");
const githelper = require("./git.js");
const shell = require("shelljs")
const colors = require('colors');
const path = process.cwd();
const git = require('simple-git')(path);

// process.on('uncaughtException', (err) => {
//   console.log(`\n ${err}`);
// });

const suffix = ".work"

function checkEnv() {
  return new Promise((resolve, reject) => {
    if (!shell.which("git")) {
      log.e("未找到git，请检查是否已经安装git")
      process.exit(1);
    }

    if (!shell.which("ak")) {
      log.e("未找到ak，请检查是否已经安装ak")
      process.exit(1);
    }

    resolve();
  })
}

function sync() {
  return new Promise((resolve, reject) => {
    log.i("同步代码到最新...")

    checkEnv()
      .then(mk)
      .then(goAssosiateBranch)
      .then(githelper.pull)
      .then(goWorkBranch)
      .then(githelper.pull)
      .then(githelper.status)
      .then((statusSummary) => {
        if (statusSummary.conflicted.length != 0) {
          log.e("代码同步结束，发现冲突，请解决后再次执行akd")
          // reject();
        } else {
          log.ok("代码同步结束，没有冲突")
          resolve(statusSummary);
        }
      })
  });
}


function goAssosiateBranch() {
  return new Promise((resolve, reject) => {
    githelper.status()
      .then((statusSummary) => {
        var currentBranch = statusSummary.current;
        // log.v("currentBranch.length=" + currentBranch.toString().length + ", suffix.length=" + suffix.length);

        var assosiateBranch = currentBranch.substring(0, currentBranch.toString().length - suffix.length);
        log.v(`\n当前在${currentBranch}分支 , 关联分支${assosiateBranch}`);
        if (!currentBranch.endsWith(suffix)) {
          resolve();
        } else {
          log.v("切换到" + colors.green(assosiateBranch));
          git.checkout(assosiateBranch, () => {
            resolve(assosiateBranch);
          })
        }
      });
  });
}

function goWorkBranch() {
  return new Promise((resolve, reject) => {
    // log.v("切换到工作分支")

    githelper.status()
      .then((statusSummary) => {
        var currentBranch = statusSummary.current;
        if (currentBranch.endsWith(suffix)) {
          resolve();
        } else {
          var workBranch = currentBranch + suffix;
          log.v("\n切换到" + colors.green(workBranch));
          git.checkout(workBranch, () => {
            resolve(workBranch);
          })
        }
      });
  });
}

function mk() {
  return new Promise((resolve, reject) => {
    githelper.status()
      .then((statusSummary) => {

        var repoClean = statusSummary.files.length == 0;

        if (repoClean) {
          createBranch(resolve);
        } else {
          // console.dir(statusSummary);
          // log.w("reason: " + reason + ", ask stash");
          githelper.askStash("检测到目录有已经修改的文件，如要stash，请输入 y :")
            .then(
              () => {
                createBranch(resolve);
              },
              () => {
                log.e("abort by user")
              })
        }
      })
  })
}

function createBranch(resolve) {
  githelper.status()
    .then((statusSummary) => {
      var currentBranch = statusSummary.current;
      if (currentBranch.endsWith(suffix)) {
        resolve();
      } else {
        shell.exec(`ak feature ${currentBranch}${suffix}`, () => {
          resolve();
        });
      }
    });
}

module.exports = {
  goAssosiateBranch: goAssosiateBranch,
  goWorkBranch: goWorkBranch,
  mk: mk,
  sync: sync
}