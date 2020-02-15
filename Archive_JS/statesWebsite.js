#!/usr/bin/nodejs

// -------------- load packages -------------- //
// INITIALIZATION STUFF

var express = require('express');
var statesFunctions = require("./States/doStatesFcnsV2.js");
var app = express();
var hbs = require('hbs');

// -------------- express initialization -------------- //
// PORT SETUP - NUMBER SPECIFIC TO THIS SYSTEM

app.set('port', process.env.PORT || 8080 );
app.set('view engine', 'hbs');

// -------------- express 'get' handlers -------------- //
// These 'getters' are what fetch your pages

//req = request, res = response
app.get('/', function(req, res){ // callback level
    res.send('hola');
});

app.get('/foo', function(req, res){
    console.log('user');
    res.send('requested foo');
});

app.get('/not_a_search', function(req, res){
    var theQuery = req.query.q;
    console.log(req.query);
    res.send('query parameter:' + theQuery);
});

//Lab 2 stuff
app.get('/getStatesBorder', function(req, res){
    var state = req.query.s;
    res.send(statesFunctions.getBorder(state));
});

app.get('/doStatesBorder', function(req, res){
    var state1 = req.query.s1;
    var state2 = req.query.s2;
    res.send(statesFunctions.sharesBorder(state1, state2));
});

//Experimenting
var view_counter = 0;
// app.get('/Views', function(req, res){
//     view_counter += 1;
//     res.send("You are visitor number " + view_counter);
// });

app.get('/Views', function(req, res){
    view_counter += 1;
    res.render('index', {numVisitors: view_counter});
});

// -------------- listener -------------- //
// // The listener is what keeps node 'alive.' 

var listener = app.listen(app.get('port'), function() {
  console.log( 'Express server started on port: '+listener.address().port );
});
