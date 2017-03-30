#!/usr/bin/env node
const git = require("./git.js");
// const spawn = require('child_process').spawn;
// const spawnSync = require('child_process').spawnSync;

// var shell = require("shelljs");
// var argv = require('yargs')
//     // .demand(['n'])
//     // .default({n: 'tom'})
//     // .describe({n: 'your name'})
//     .argv;



// function currentBranchName() {
//     var result = spawnSync('git', ['branch'], {
//         encoding: 'utf8'
//     });

//     var branch = "";

//     result.stdout
//         .toString()
//         .trim()
//         .split('\n')
//         .forEach(function(v, i) {
//             var trimV = v.trim();
//             if (trimV.indexOf("*") != -1) {
//                 branchName = trimV.substring(2);
//             }
//         });

//     return branchName;
// }

console.log("branch is: " + git().currentBranchName());
console.log("isDirty: " +git().isDirty());
