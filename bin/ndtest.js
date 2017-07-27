#!/usr/bin/env node

const term = require('terminal-kit').terminal;
const log = require("./log.js");

var people = ['瓦雷', '重娄', '优敏', '工口', '兮乐', '沂风', '豪雄', '苍鸾', '晨暖']
var peoplephone = [{
    '瓦雷': '13916459723'
}, {
    '工口': '17195877744'
}, {
    '重娄': '18757556715'
}]

function selectReviewer() {
    return new Promise((resolve, reject) => {
        const run = term.singleColumnMenu(people, [], (error, response) => {
            if (error != undefined) {
                reject(error);
                return;
            }
            atPhone = peoplephone[response.selectedText]
            resolve(response.selectedText)
        })
    })
}


selectReviewer()
    .then(
        (name) => {
            log.i(name)
            term.processExit();
            log.i("11001010101")
        }, () => {
            log.i("5555...")
        })
    .catch(e => {
        console.log(e)
    })
