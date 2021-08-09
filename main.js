let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
//venue date opponent result runs balls fours sixes sr 
let request = require("request");
let cheerio = require("cheerio");
let scorecardObj = require("./scorecard");
let path = require("path");
let fs = require("fs");
let iplPath = path.join(__dirname, "IPL");
createDirectory(iplPath);
request(url, cb);

function cb(error, response, html) {
    if(error) {
        console.log(error);
    } else if(response.statusCode == 404) {
        console.log("Page Not Found");
    } else {
        dataExtracter(html);
    }
}
function dataExtracter(html) {
    // search tool
    let searchTool = cheerio.load(html);
    // css selector -> elem
    let anchorElem = searchTool("a[data-hover='View All Results']");
    let link = anchorElem.attr("href");
    //let fullAllMatchPageLink = "www.espncricinfo.com" + link;
    let fullAllMatchPageLink = `https://espncricinfo.com${link}`;
    // go to all Match Page
    request(fullAllMatchPageLink, allMatchPageCb);

}
function allMatchPageCb(error, response, html){
    if(error) {
        console.log(error);
    } else if(response.statusCode == 404) {
        console.log("Page Not Found");
    }  else {
        getAllScoreCardLink(html);
    }
}
function getAllScoreCardLink(html){
    console.log("````````````````````");
    let searchTool = cheerio.load(html);
    let scorecardsArr = searchTool("a[data-hover='Scorecard']");
    for(let i=0; i < scorecardsArr.length; i++)  {
        let link = searchTool(scorecardsArr[i]).attr("href");
        let fullMatchPageLink = `https://espncricinfo.com${link}`;
        console.log(fullMatchPageLink);
        scorecardObj.psm(fullMatchPageLink);

    } 
console.log("`````````````````````````````````````");
}
function createDirectory(filepath) {
    if(fs.existsSync(filepath) == false) {
        fs.mkdirSync(filepath);
    }
}


