#!/usr/bin/env node

const git = require("./git.js");

console.log("branch is: " + git().currentBranchName());
console.log("isDirty: " + git().isDirty());

git().checkoutBranch("hhh");