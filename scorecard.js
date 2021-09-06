let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');
let path = require('path');

function processSingleMatch(url) {
    request(url, cb);
}
function cb(error, response, html) {
    if (error) {
        console.log(error);
    } else if (response && response.scorecard == 404) {
        console.log("Page Not Found");
    } else {
        dataExtracter(html);
    }
}
function dataExtracter(html) {
    let $ = cheerio.load(html);
    // let descElems = $(".event .description");
    let descElems = $(".header-info .description");
    let result = $(".event .status-text");
    let strArr = descElems.text().split(",");
    let venue = strArr[1].trim();
    let date = strArr[2].trim();
        result = result.text();
    let bothInningsArr = $(".Collapsible");
    for(let i = 0; i < bothInningsArr.length; i++) {
        let teamNameElem = $(bothInningsArr[i]).find("h5");
        let teamName = teamNameElem.text();
        teamName = teamName.split("INNINGS")[0];
        teamName = teamName.trim();
        // console.log("````````````````````````````````````");
        // console.log(`${venue} |${date} |${teamName}`);
        
        let allRows = $(bothInningsArr[i]).find(".table.batsman tbody tr");
        for(let j = 0; j<allRows.length; j++){
            let numberOfTds = $(allRows[j]).find("td");
            if(numberOfTds.length==8){
                let playerName = $(numberOfTds[0]).text().trim();
                let runs = $(numberOfTds[2]).text().trim();
                let balls = $(numberOfTds[3]).text().trim();
                let fours = $(numberOfTds[5]).text().trim();
                let sixes = $(numberOfTds[6]).text().trim();
                let sr = $(numberOfTds[7]).text().trim();
                // console.log(`${playerName}|${runs}|${balls}|${fours}|${sixes}|${sr}`);
                console.log(`${teamName}|${playerName}|${runs}|${balls}|${fours}|${sixes}|${sr}|${venue}|${date}|${result}`);
                processPlayer(teamName,playerName,runs,balls,fours,sixes,sr,venue,date,result);
            }
        }

    }
}
function processPlayer(teamName,playerName,runs,balls,fours,sixes,sr,venue,date,result){
    let teamPath = path.join(__dirname,"IPL",teamName);
    let playerObj = {
        teamName,
        playerName,
        runs,
        balls,
        fours,
        sixes,
        sr,
        venue,
        date,
        result
    }
    let arrResult = [];
    dirCreater(teamPath);
    let playerPath = path.join(teamPath,playerName+".json");
    if(fs.existsSync(playerPath)==false){
        arrResult[0] = playerObj;
        let jsonWritable = JSON.stringify(arrResult);
        fs.writeFileSync(playerPath,jsonWritable);
    }
    else{
        let data = fs.readFileSync(playerPath);
        let jsonData = JSON.parse(data);
        jsonData.push(playerObj);
        let jsonWritable = JSON.stringify(jsonData);
        fs.writeFileSync(playerPath,jsonWritable);
    }
}
function dirCreater(filePath) {
    if(fs.existsSync(filePath)==false){
        fs.mkdirSync(filePath);
    }
}
module.exports = {
    psm: processSingleMatch
}