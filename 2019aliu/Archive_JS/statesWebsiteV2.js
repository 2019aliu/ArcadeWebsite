#!/usr/bin/nodejs

// Import packages
var express = require('express');
var path = require('path');
var app = express();
// var window = require('Window');

var statesFunctions = require('./States/doStatesFcnsV2.js');

// express initialization: set the port number
app.set('port', process.env.PORT || 8080 );

// set folders
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Middleware functions

function getStateParams (req, res, next) {
    var rawInput = window.prompt("Enter one state to find its borders, two states to find whether they border each other (SEPARATE WITH COMMA):");
    var inputKeys = rawInput.split(", ");
    
    if (inputKeys.length == 1){
        res.locals.linkExt = 'getStatesBorder';
        res.locals.state1 = req.query[inputKeys[0]];
    }
    else if (inputKeys.length == 2){
        res.locals.linkExt = 'isStatesBorder';
        res.locals.state1 = req.query[inputKeys[0]];
        res.locals.state2 = req.query[inputKeys[1]];
    }
    
    next();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Getters

// Homepage
app.get('/', function(req, res){res.sendfile(__dirname + '/index.html');});

// States functions -- BROKEN
app.get('/states', [getStateParams], function(req, res){
    newLink = "http://user.tjhsst.edu/2019aliu/" + res.locals.linkExt;
    res.render(newLink);
});

app.get('/getStatesBorder', function(req, res){
    var state = res.locals.state1;
    res.send(statesFunctions.getBorder(state));
});

app.get('/isStatesBorder', function(req, res){
    var state1 = res.locals.state1;
    var state2 = res.locals.state2;
    res.send(statesFunctions.sharesBorder(state1, state2));
});

// Fun Homepage
app.get('/funpage', function(req, res){
    res.sendfile(__dirname + '/HTML/funpage.html');
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// listener
var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port );
});
