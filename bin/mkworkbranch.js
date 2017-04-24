#!/usr/bin/env node

const Promise = require("bluebird");
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

function sync() {
  return new Promise((resolve, reject) => {
    log.i("开始同步代码")

    mk()
      .then(goAssosiateBranch)
      .then(pull)
      .then(goWorkBranch)
      .then(pull)
      .then(git.checkModifyFiles)
      .then((hasModify) => {
        // log.i("\n")
        
        if (hasModify) {
          log.e("代码同步结束，发现冲突，请解决后再次执行")
          reject();
        } else {
          // log.v("\n");
          log.ok("代码同步结束，没有冲突")
          resolve();
        }
      })
  });
}

function pull(branch) {
  return new Promise((resolve, reject) => {
    log.v("同步" + branch +"分支代码到最新..")

    git
      .outputHandler(function (command, stdout, stderr) {
        stdout.pipe(process.stdout);
        stderr.pipe(process.stderr);
      })
      .pull(['--rebase'], (err, out) => {
        resolve();
      })
  });
}

function goAssosiateBranch() {
  return new Promise((resolve, reject) => {
    githelper.getCurrentBranchName()
      .then((currentBranch) => {
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

    githelper.getCurrentBranchName()
      .then((currentBranch) => {
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
    githelper.checkRepoClean()
      .then(
        (repoClean) => {
          createBranch(resolve);
        },
        () => {
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
      );
  });
}

function createBranch(resolve) {
  githelper.getCurrentBranchName()
    .then((currentBranch) => {
      if (currentBranch.endsWith(suffix)) {
        resolve();
      } else {
        shell.exec(`ak feature ${currentBranch}${suffix}`, () => {
          resolve();
        });
      }
    });
}




mk();

module.exports = {
  goAssosiateBranch: goAssosiateBranch,
  goWorkBranch: goWorkBranch,
  mk: mk,
  sync: sync
}