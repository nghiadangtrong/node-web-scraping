// web scraping in Node
const rp = require('request-promise');      // Send required
const cheerio = require('cheerio');         // create virtual html
const Table = require('cli-table');         // create Table in cli
const _ = require('lodash');                // 

let table = new Table({
    head: ['username', '❤️', 'challenges'],
    colWidths: [15, 5, 10]
})

const URL_GET_USERS = 'https://www.freecodecamp.org/forum/directory_items?period=weekly&order=likes_received'
const URL_GET_USER_BY_NAME = 'https://api.freecodecamp.org/internal/api/users/get-public-profile?username='

const options_get_user = {
    url: URL_GET_USERS,
    json: true
}

rp(options_get_user)
    .then((data => {
        let userData = [];
        for(let user of data.directory_items) {
            userData.push({name: user.user.username, likes_received: user.likes_received})
        }

        process.stdout.write('loading ');
        getChallengesCompletedAndPushToUserArray(userData);
    }))
    .catch(error => {
        console.log('[-] error: ', error)
    })


function getChallengesCompletedAndPushToUserArray (userData) {
    var i = 0;
    
    function next() {
        if(i < userData.length) {
            let {name} = userData[i];
            var options_get_user_by_name = {
                // url: "https://www.freecodecamp.org/" + userData[i].name,
                // transform: body => cheerio.load(body)
                url: URL_GET_USER_BY_NAME + name,
                json: true
            }

            rp(options_get_user_by_name) 
                .then(function (infoUser) {
                    // const fccAcount = $('div.notfound-page-wrapper').length === 0;
                    // const challengesPassed = fccAcount ? $('tbody tr').length : 'unknown';

                    // const fccAcount = isEmpty(infoUser)
                    const challengesPassed = _.get(infoUser, `entities.user.${name}.completedChallenges`, []).length

                    table.push([userData[i].name, userData[i].likes_received, challengesPassed]);
                    ++i;

                    return next()
                })
        } else {
            printData();
        }
    }

    return next();
}

function printData() {
    console.log("[✔]");
    console.log(table.toString())
}

function isEmpty(value) {
    return !value 
        || value !== ''
        || (Array.isArray(value) && value.length === 0)
        || (Object.keys(value).length === 0)
        || value
}