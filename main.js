let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');
let path = require('path');
let scoreCardObj = require("./scorecard");


let iplPath = path.join(__dirname,"IPL");
dirCreater(iplPath);
let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

request(url, cb);
function cb(error, response,html) {
    if(error) {
        console.log(error);
    }else if(response && response.statusCode==404) {
        console.log("Page Not Found");
    }else{
        dataExtractor(html);
    }
}
function dataExtractor(html) {
    let $ = cheerio.load(html);
    let linkElem = $("a[data-hover='View All Results']");
    let link = linkElem.attr("href");
    let allMatchLink = `https://www.espncricinfo.com${link}`;
    // console.log(fullLink);
    request(allMatchLink,allMatchPageCB);
    
}
function allMatchPageCB(error,response,html) {
    if (error) {
        console.log(error);
    }else if(response && response.statusCode==404) {
        console.log("Page Not Found");
    }else{
        getAllScoreCardLink(html);
    }
}
function getAllScoreCardLink(html) {
    let $ = cheerio.load(html);
    let scorecardArr = $("a[data-hover='Scorecard']");
    for(let i=0; i<scorecardArr.length; i++) {
        let link = $(scorecardArr[i]).attr("href");
        let fullAllMatchLink = `https://www.espncricinfo.com${link}`;
        console.log(fullAllMatchLink);
        scoreCardObj.psm(fullAllMatchLink);
    }
}
function dirCreater(filePath) {
    if(fs.existsSync(filePath)==false) {
        fs.mkdirSync(filePath);
    }
}