// let url = "https://espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";
let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
// get single match url
function processSingleMatch(url){
    request(url, cb);
}
function cb(error, response, html) {
    if(error) {
        console.log(error);
    } else if (response.statusCode == 404) {
        console.log("Page Not Found");
    } else {
        extractMatchDetail(html);
    }
}

function extractMatchDetail(html) {
    // ipl  ka folder banega
     // team
            // player 
                    // runs balls fours sixes sr opponent venue date 
    // common attributes = venue date result (same hi rrahega dono teams ke lie)
    // venue and date -> .event .description
    // result -> .event .status-text            
    let searchTool = cheerio.load(html);
    let descElem = searchTool(".event .description");
    let result = searchTool(".event .status-text");
    let stringArr = descElem.text().split(",");
    let venue = stringArr[1].trim();
    let date = stringArr[2].trim();
    result = result.text();

    let InningsArr = searchTool(".Collapsible");
    for(let i=0; i < InningsArr.length; i++) {
      // scorecard = searchTool(InningArr[i]).html();
        let teamNameEle = searchTool(InningsArr[i]).find("h5");
        let teamName = teamNameEle.text();
        teamName = teamName.split("INNINGS")[0];
        teamName = teamName.trim();
        // opponent
        let oppidx = i==0?1:0;
        let oppTeamName = searchTool(InningsArr[oppidx]).find("h5").text();
        oppTeamName = oppTeamName.split("INNINGS")[0].trim();
        //console.log(venue+ " "+ date+ " "+ teamName+ " "+oppTeamName + " "+ result);

        
       // task is to get the batsman's
        let batsManTableBodyAllRows = searchTool(".table.batsman tbody tr");
        // console.log(batsManTableBodyAllRows.length); -> length = No. of rows(BatsMan)
        // type cohersion loops 
        for(let j = 0; j < batsManTableBodyAllRows.length; j++) {
            //number of columns in respective rows
            let numberOfTds = searchTool(batsManTableBodyAllRows[j]).find("td");
            // console.log(numberOfTds.length);
            if(numberOfTds.length == 8) {
                 let playerName = searchTool(numberOfTds[0]).text();
                 let runs = searchTool(numberOfTds[2]).text().trim();
                 let balls = searchTool(numberOfTds[3]).text().trim();
                 let fours = searchTool(numberOfTds[5]).text().trim();
                 let sixes = searchTool(numberOfTds[6]).text().trim();
                 let sr = searchTool(numberOfTds[7]).text().trim();

                 console.log(playerName+ " "+ runs+ " "+ balls+ " "+ fours+ " "+ sixes+ " "+ sr);
                finalProcessing(teamName, playerName, runs, balls, fours, sixes, sr, oppTeamName, venue, date, result);
            }
        } 
      
    }
}
// Final Processing
function finalProcessing(teamName, playerName, runs, balls, fours, sixes, sr, oppTeamName, venue, date, result) {
    let teamPath = path.join(__dirname, "IPL", teamName);
    let inputData = {
        teamName,
        playerName,
        runs,
        balls,
        fours,
        sixes,
        sr,
        oppTeamName,
        venue,
        date,
        result
    }
    createDirectory(teamPath);
    let playerPath = path.join(teamPath, playerName + ".json");
    let jsonWriteable = JSON.stringify(inputData);
    fs.writeFileSync(playerPath, jsonWriteable);
}
function createDirectory(filepath) {
    if(fs.existsSync(filepath) == false) {
        fs.mkdirSync(filepath);
    }
}
module.exports = {
    psm : processSingleMatch
}