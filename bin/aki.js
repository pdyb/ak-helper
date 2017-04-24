#!/usr/bin/env node

const mk = require("./mkworkbranch.js")
const path = process.cwd();
const git = require('simple-git')(path);
const shell = require("shelljs")
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const log = require("./log.js");

mk.mk();