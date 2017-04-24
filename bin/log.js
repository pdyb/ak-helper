#!/usr/bin/env node
const readline = require('readline');
const colors = require('colors');

exports.v = (msg) => {
    console.log(colors.dim(msg));
};

exports.i = (msg) => {
    console.log(colors.cyan(msg));
};

exports.w = (msg) => {
    console.log(colors.yellow(msg));
};

exports.e = (msg) => {
    console.log(colors.red(msg));
};

exports.ok = (msg) => {
    console.log(colors.green(msg));
};

exports.question = (tip, action) => {
    const rl = readline
        .createInterface({
            input: process.stdin,
            output: process.stdout
        });
    rl.question(colors.cyan(tip), (answer) => {
        action(answer);
        rl.close();
    });
};