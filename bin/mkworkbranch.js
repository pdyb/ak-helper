#!/usr/bin/env node

var shell = require("shelljs");
var argv = require('yargs') 
  // .demand(['n'])
  // .default({n: 'tom'})
  // .describe({n: 'your name'})
  .argv;

console.log('hello ', process.argv[2]);
console.log('hello ', argv._[0]);

console.log('hello ', argv.n);

shell.exec("echo hello " + argv.name);