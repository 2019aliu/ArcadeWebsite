#!/usr/bin/nodejs


// -------------- load packages -------------- //
var cookieSession = require('cookie-session');  // for cookies -- logging into ion
var simpleoauth2 = require('simple-oauth2');
var request = require('request');
var express = require('express');  // load web framework
var app = express();
var path = require('path');  // for directories
var hbs = require('hbs');  // handlebars
var mysql = require('mysql');  // SQL server stuff
// var CronJob = require('cron').CronJob;  // cron for updating things regularly

var scrabbleFcns = require('./js/wordSearch.js');

// -------------- express initialization -------------- //
app.set('port', process.env.PORT || 8080 );  // set up the port
app.set('view engine', 'hbs');  // set up handlebars
app.set('trust proxy', 1);  // trust first proxy <-- not sure what this means...but I'll use it for now


// -------------- serve static folders -------------- //
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/img', express.static(path.join(__dirname, 'img')));


// -------------- cookie session initialization -------------- //
app.use(cookieSession({
    name: 'loginCookie',
    keys: ['testingCookies1', 'testingCookies2']
}));


// -------------- variable definitions -------------- //

// Parameters for OAuth Client
var ion_client_id = "ltY07tqEQGC62yenAfmzgCK6OB8COk6EwLEh4wlh";
var ion_client_secret = "a9zj8ZzlkR1VlcMAQDBxtbiecOuLB4njFbds7fknZJEHoVDoXYXiZk8fa0UKhcZIYSGd0TaxXbjPjmsk1VbuXih4edvx5iJGMZ04iZLkhQo7ZXLG43mZrEKGlrUYltWz";
var ion_redirect_uri = "https://user.tjhsst.edu/2019aliu/login";

// OAuth object to manage OAUTH operations
var oauth = simpleoauth2.create({
    client: {
        id: ion_client_id,
        secret: ion_client_secret
    },
    auth: {
        tokenHost: "https://ion.tjhsst.edu/oauth/",
        authorizePath: "https://ion.tjhsst.edu/oauth/authorize/",
        tokenPath: "https://ion.tjhsst.edu/oauth/token/"
    }
});

// Link for authorization. Takes client to Ion server, asks if client is willing to give read permissions to ION
var authorizationUri = oauth.authorizationCode.authorizeURL({
    scope: "read",
    redirect_uri: ion_redirect_uri
});

// For collecting feedback
var ratings = [];
var reactions = {
    "Like": 0,
    "Love": 0,
    "Haha": 0,
    "Angry": 0,
    "Wow": 0,
    "Sad": 0
};

var visitorCount = 0;  //haven't used this, oops

var pool  = mysql.createPool({
  connectionLimit : 10,
  user            : 'site_2019aliu',
  password        : 'WFELBpgZ5CbbDMpZapEQNEXq',
  host            : 'mysql1.csl.tjhsst.edu',
  port            : 3306,
  database        : 'site_2019aliu'
});

// -------------- middleware funcions -------------- //

function displayUsername(req, res, next) {
    if ("userInfo" in req.session) {
        req.session.tjUsername = req.session.userInfo.ion_username;
    }
    else {
        req.session.tjUsername = "Login";
    }
    next();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// -------------- express 'get' handlers -------------- //
app.get('/', [displayUsername], function(req, res){
    res.render('index', {"tjUser": req.session.tjUsername});
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// States Game

app.get('/statesGame', [displayUsername], function(req, res){
    res.render('statesGame', {"tjUser": req.session.tjUsername});
});

app.get('/statesRules', [displayUsername], function(req, res){
    res.render('statesRules', {"tjUser": req.session.tjUsername});
});

app.get('/statesFeedback_received', function(req, res){
    // Get all of the data from the form
    var myUsername = req.query.username;
    var myRating = req.query.rating;
    var myReaction = req.query.reaction;
    
    // Site statistics updating
    ratings.push(parseInt(myRating, 10));
    reactions[myReaction] += 1;

    var numRatings = ratings.length;  //yes this should be the same as the number of reactions...but just in case, you know?
    var numReactions = 0;
    for (let tempReaction in reactions) {
        numReactions += reactions[tempReaction];
    }
    var totalRating = 0;
    ratings.forEach(function(elem){
        totalRating += elem;
    });
    
    // Calculating site averages
    var rawRatingAvg = (totalRating + 0.0) / numRatings;
    var avgRating = Math.round(rawRatingAvg * 100) / 100;
    
    var sameReaction = reactions[myReaction];
    // var rawReactAvg = (sameReaction + 0.0) / numReactions * 100;
    var rawReactAvg = (sameReaction + 0.0) / numRatings * 100;
    var sameReactionAvg = Math.round(rawReactAvg * 100) / 100;
    
    // Produce and send a response
    var articleA = (myReaction === "Angry") ? "an" : "a";  // very minor thing
    var response = {
        distRating: ratings,
        distReaction: reactions,
        message: myUsername + ", you gave this game a " + myRating + " out of 5, and reacted with " + articleA + " " + myReaction,
        statsMessage: "The average rating of this game out of " + numRatings + " users is " + avgRating + ". <br>" + sameReaction + " out of " + numReactions + " users (" + sameReactionAvg + "%) have now given " + articleA + " " + myReaction + "."
    };

    res.send(response);
});

app.get('/statesFeedback', [displayUsername], function(req, res){
    res.render('statesFeedback', {"tjUser": req.session.tjUsername});
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Scrabble

///////////////////////// Import statements /////////////////////////

// Imported stuff
var fs = require('fs');  // import file systems

///////////////////////// File I/O  /////////////////////////

// make the dictionary of words
// Order: get file, make a string out of all words, split by \n, split by \r, get rid of all empty spaces
var wordList = fs.readFileSync(__dirname + '/ScrabbleFiles/wordsWithFriends.txt').toString().split("\n").join("\r").split("\r").filter(function(word){
    return word !== "";
});

// make dictionary of points
// same order as before (referencing the parsing of word List)
var scrabbleListRAW = fs.readFileSync(__dirname + '/ScrabbleFiles/scrabbleLetters.txt').toString().split("\n").join("\r").split("\r").filter(function(word){
    return word !== "";
});

// split all items into list
var scrabbleList = scrabbleListRAW.map(x => x.split(" "));

// make object of point values for each letter
var scrabblePoints = scrabbleList.reduce(function(output, elem){
    output[elem[0].toLowerCase()] = parseInt(elem[2]);
    return output;
}, {});

// make frequency distribution for the letters 
var scrabbleFreq = scrabbleList.reduce(function(output, elem){
    output[elem[0].toLowerCase()] = parseInt(elem[1]);
    return output;
}, {});

app.get('/scrabbleSolver', [displayUsername], function(req, res){
    // if (typeof req.session.token == 'undefined') {
    //     // res.render('loginPage', {"myOAuthUri": authorizationUri});
    //     res.render('scrabbleLogin', {"myOAuthUri": authorizationUri});
    // }
    // else {
        res.render('scrabbleSolver', {"tjUser": req.session.tjUsername});
    // }
});

app.get('/scrabbleSolver_received', [displayUsername], function(req, res){
    
    // Get data from AJAX get request
    var myLetters = req.query.letters;
    var myFiltersLI = req.query.lettersIndexesContained;
    
    // console.log(myLetters);
    // Run the word search
    var allLetters = myLetters.toLowerCase().split("");
    var wordDict = [...wordList];
    var allWords = scrabbleFcns.wordSearch(allLetters, wordDict);
    var allPoints = scrabbleFcns.generatePoints(allLetters, allWords, scrabblePoints);
    var filteredWords;
    
    // var filters = {};
    // Filtered word search
    if (myFiltersLI.length > 0) {
        var filtersRAW = myFiltersLI.split(", ");
        // console.log(filtersRAW);
        var filters = {};
        for (var i = 0; i < filtersRAW.length; i++) {
            var tempFilter = filtersRAW[i].split(" ");
            // console.log(tempFilter);
            // this works only because js is weird. tempFilter[0] IS ACTUALLY A STRING WTFWTFWTF
            // DO NOT MISUSE THIS
            filters[tempFilter[0]] = tempFilter[1].toLowerCase();
        }
        // console.log(filters);
        filteredWords = scrabbleFcns.filterWordsLI(allWords, filters);
    }
    
    // Generate JSON to send back
    var response = {
        words: allWords,
        points: allPoints,
        filteredWords: filteredWords
    };
    
    res.send(response);
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// SQL + AJAX (ultimately cookie clicker)

app.get('/cookieClicker', [displayUsername], function(req, res){
    if (typeof req.session.token == 'undefined') {
        // res.render('loginPage', {"myOAuthUri": authorizationUri});
        res.render('cookieClickerLogin', {"myOAuthUri": authorizationUri});
    }
    else {
        var sqlSelect='SELECT cookiesCount, upgradeA, upgradeB, upgradeC, upgradeD, upgradeE FROM cookieClickers WHERE user="' + req.session.tjUsername + '"';
        pool.query(sqlSelect, function (error, results, fields) {
            if (error) throw error;
        //     console.log(results[0]);
            res.render('cookieClicker', {
                "tjUser": req.session.tjUsername,
                "userNumCookies": results[0].cookiesCount,
                "userUpgradeA": results[0].upgradeA,
                "userUpgradeB": results[0].upgradeB,
                "userUpgradeC": results[0].upgradeC,
                "userUpgradeD": results[0].upgradeD,
                "userUpgradeE": results[0].upgradeE
            });
        });
    }
    
});

app.get('/cookieClicker_addClick', [displayUsername], function(req, res){
    var numCookies = parseInt(req.query.cookies, 10);  // this will just be one
    var click = parseInt(req.query.click, 10);  // if this is a click
    
    var cookieStr;
    
    var sqlClick='call updateCookieClicker("' + req.session.tjUsername + '",' + numCookies + ', 1)';
    pool.query(sqlClick, function (error, results, fields) {
        if (error) throw error;
        
        var sqlSelect='SELECT cookiesCount FROM cookieClickers WHERE user="' + req.session.tjUsername + '"';
        pool.query(sqlSelect, function (error, results, fields) {
            if (error) throw error;
            cookieStr = "Number of cookies: " + results[0].cookiesCount + " cookies";
            var response = {
                cookieMsg: cookieStr,
                cookies: results[0].cookiesCount
            };
            console.log(response);
            res.send(response);
        });
    });
});

app.get('/cookieClicker_upgradeA', [displayUsername], function(req, res){
    var numUpgradeA = parseInt(req.query.numUpgradeA, 10);  // this will be just be one
    // console.log(numUpgradeA);
    
    var upgradeStr;
    var cookieStr;
    
    var sqlClick='call updateUpgradeA("' + req.session.tjUsername + '",' + numUpgradeA + ')';
    pool.query(sqlClick, function (error, results, fields) {
        if (error) throw error;
        
        var sqlSelect='SELECT cookiesCount, upgradeA FROM cookieClickers WHERE user="' + req.session.tjUsername + '"';
        pool.query(sqlSelect, function (error, results, fields) {
            if (error) throw error;
            
            upgradeStr = "" + results[0].upgradeA;
            cookieStr = "Number of cookies: " + results[0].cookiesCount + " cookies";
            // console.log(upgradeStr);
            
            var response = {
                upgradeMsg: upgradeStr,
                upgradeA: results[0].upgradeA,
                cookieMsg: cookieStr,
                cookies: results[0].cookiesCount
            };
            console.log(response);
            res.send(response);
        });
    });
});

app.get('/cookieClicker_upgradeB', [displayUsername], function(req, res){
    var numUpgradeB = parseInt(req.query.numUpgradeB, 10);  // this will be just be one
    // console.log(numUpgradeB);
    
    var upgradeStr;
    var cookieStr;
    
    var sqlClick='call updateUpgradeB("' + req.session.tjUsername + '",' + numUpgradeB + ')';
    pool.query(sqlClick, function (error, results, fields) {
        if (error) throw error;
        
        var sqlSelect='SELECT cookiesCount, upgradeB FROM cookieClickers WHERE user="' + req.session.tjUsername + '"';
        pool.query(sqlSelect, function (error, results, fields) {
            if (error) throw error;
            
            upgradeStr = "" + results[0].upgradeB;
            cookieStr = "Number of cookies: " + results[0].cookiesCount + " cookies";
            
            var response = {
                upgradeMsg: upgradeStr,
                upgradeB: results[0].upgradeB,
                cookieMsg: cookieStr,
                cookies: results[0].cookiesCount
            };
            console.log(response);
            res.send(response);
        });
    });
});

app.get('/cookieClicker_upgradeC', [displayUsername], function(req, res){
    var numUpgradeC = parseInt(req.query.numUpgradeC, 10);  // this will be just be one
    // console.log(numUpgradeB);
    
    var upgradeStr;
    var cookieStr;
    
    var sqlClick='call updateUpgradeC("' + req.session.tjUsername + '",' + numUpgradeC + ')';
    pool.query(sqlClick, function (error, results, fields) {
        if (error) throw error;
        
        var sqlSelect='SELECT cookiesCount, upgradeC FROM cookieClickers WHERE user="' + req.session.tjUsername + '"';
        pool.query(sqlSelect, function (error, results, fields) {
            if (error) throw error;
            
            upgradeStr = "" + results[0].upgradeC;
            cookieStr = "Number of cookies: " + results[0].cookiesCount + " cookies";
            
            var response = {
                upgradeMsg: upgradeStr,
                upgradeC: results[0].upgradeC,
                cookieMsg: cookieStr,
                cookies: results[0].cookiesCount
            };
            console.log(response);
            res.send(response);
        });
    });
});

app.get('/cookieClicker_upgradeD', [displayUsername], function(req, res){
    var numUpgradeD = parseInt(req.query.numUpgradeD, 10);  // this will be just be one
    // console.log(numUpgradeB);
    
    var upgradeStr;
    var cookieStr;
    
    var sqlClick='call updateUpgradeD("' + req.session.tjUsername + '",' + numUpgradeD + ')';
    pool.query(sqlClick, function (error, results, fields) {
        if (error) throw error;
        
        var sqlSelect='SELECT cookiesCount, upgradeD FROM cookieClickers WHERE user="' + req.session.tjUsername + '"';
        pool.query(sqlSelect, function (error, results, fields) {
            if (error) throw error;
            
            upgradeStr = "" + results[0].upgradeD;
            cookieStr = "Number of cookies: " + results[0].cookiesCount + " cookies";
            
            var response = {
                upgradeMsg: upgradeStr,
                upgradeD: results[0].upgradeD,
                cookieMsg: cookieStr,
                cookies: results[0].cookiesCount
            };
            console.log(response);
            res.send(response);
        });
    });
});

app.get('/cookieClicker_upgradeE', [displayUsername], function(req, res){
    var numUpgradeE = parseInt(req.query.numUpgradeE, 10);  // this will be just be one
    // console.log(numUpgradeB);
    
    var upgradeStr;
    var cookieStr;
    
    var sqlClick='call updateUpgradeE("' + req.session.tjUsername + '",' + numUpgradeE + ')';
    pool.query(sqlClick, function (error, results, fields) {
        if (error) throw error;
        
        var sqlSelect='SELECT cookiesCount, upgradeE FROM cookieClickers WHERE user="' + req.session.tjUsername + '"';
        pool.query(sqlSelect, function (error, results, fields) {
            if (error) throw error;
            
            upgradeStr = "" + results[0].upgradeE;
            cookieStr = "Number of cookies: " + results[0].cookiesCount + " cookies";
            
            var response = {
                upgradeMsg: upgradeStr,
                upgradeE: results[0].upgradeE,
                cookieMsg: cookieStr,
                cookies: results[0].cookiesCount
            };
            console.log(response);
            res.send(response);
        });
    });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Miscellaenous pages (About, authentication)

app.get('/about', [displayUsername], function(req, res){
    res.render('about', {"tjUser": req.session.tjUsername});
});

app.get('/loginPage', [displayUsername], function(req, res){
    // Here we ask if the token key has been attached to the session...
    if (typeof req.session.token == 'undefined') {
        // ...if the token does not exist, this means that the user has not logged in
    
        // if the user has not logged in, we'll send them to a page asking them to log in
        res.render('loginPage', {"myOAuthUri": authorizationUri})

    } 
    else {
        // Now, we create a personalized greeting page. Step 1 is to 
        // ask ION for your name, which means conducting a request in the
        // background before the user's page is even rendered.

        // To start the process of creating an authenticated request, 
        // I take out the string 'permission slip' from 
        // the token. This will be used to make an ION request with your
        // credentials
        var access_token = req.session.token.token.access_token;
        
        // Next, construct an ION api request that queries the profile using the 
        // individual who has logged in's credentials (it will return) their
        // profile https://ion.tjhsst.edu/api/profile?format=json&access_token=AwU9TGASFUrTDxOtjf9pnGAFY3RtTG <-- this one is mine
        var my_ion_request = 'https://ion.tjhsst.edu/api/profile?format=json&access_token='+access_token;

        // Perform the asynchronous request ...
        request.get( {url:my_ion_request}, function (e, r, body) {
            // and here, at some later (indeterminite point) we land.
            // Note that this is occurring in the future, when ION has responded
            // with our profile.

            // The response from ION was a JSON string, so we have to turn it
            // back into a javascript object
            res_object = JSON.parse(body);
            
            req.session.userInfo = res_object;
        
            // extract all information on TJ profile
            var tjUsername = res_object["ion_username"];
            var user_name = res_object['short_name'];
            var profilePicture = res_object["picture"];
            
            res.render('profile', {
                "tjUser": tjUsername,
                "shortName": user_name,
                "profilePic": profilePicture
            });
        });
    }
});
// -------------- intermediary login helper -------------- //

// The name '/login' here is not arbitrary!!! The location absolutely
// must match ion_redirect_uri for OAUTH to work!
app.get('/login', async function (req, res) {

    // The whole purpose of this 'get' handler is to attach your  token to the session. 
    // Your users should not be going here if they are not trying to login in - and you
    // should not be attaching your login token in any other methods (like the default landing page)

    // Step one. Assuming we were send here following an authentication and that there is a code attached.
    if (typeof req.query.code != 'undefined') {
        
        // This code was generated by ION. We need it to...
        var theCode = req.query.code ;

        // .. construct options that will be used to generate a login token
        var options = {
            code: theCode,
            redirect_uri: ion_redirect_uri,
            scope: 'read'
         };

        // This code will be passed back to ion to request a token.
        result = await oauth.authorizationCode.getToken(options);
        token = oauth.accessToken.create(result);
        
        // attach the token to the cookie
        req.session.token = token;
        
        // send user to the login page
        res.redirect('https://user.tjhsst.edu/2019aliu/loginPage');
    } 
    else {
        res.send('no code attached');
    }
});

app.get('/logout', function(req, res){
    req.session = null;
    res.redirect('https://user.tjhsst.edu/2019aliu/loginPage');
});

// If the page doesn't exist, return a 404 page
// NOTE: This doesn't actually return a 404 error
app.get('/:page', [displayUsername], function(req, res){
    var landingPage = req.params.page;
    console.log('User requested page: '+landingPage); // for debugging purposes
    res.render('error404', {"tjUser": req.session.tjUsername});
});


// -------------- listener -------------- //
// The listener is what keeps node 'alive.' 

var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port );
});
