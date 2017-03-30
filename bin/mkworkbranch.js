#!/usr/bin/env node

const git = require("./git.js");

process.on('uncaughtException', (err) => {
  console.log(`\n ${err}`);
});

console.log("branch is: " + git().currentBranchName());
console.log("isDirty: " + git().isDirty());


git().stashApply("git apply出错了，请检查冲突后，手动执行git apply");  

console.log("before end");