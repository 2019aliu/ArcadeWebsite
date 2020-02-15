/*
@author ALiu
Client side js
This is where all of the magic happens
*/

/*
To-do: put img in wrapper div of svg for Flags
appendChild (in js)
document.createElement("img");  //check the syntax
set coordinates in inline css
*/


// var promptTest = prompt("How many mines?");
// console.log(promptTest);
var mineCount = 8;
var flagColor = '#0C69E8';

////////////////////////////////////////////////////////////////////////////////////////////////////
// timer functionalities

// define fields
var displayTime = document.getElementById('displayTime');
var start = document.getElementById('start');
var stop = document.getElementById('stop');
var clear = document.getElementById('clear');
var minutes = 0;
var seconds = 0;
var tenSecs = 0;
var t;

var timerOn = false;

function timer(){
    t = setTimeout(add, 100);
}

function add(){
    //first add te time appropriately
    tenSecs++;
    if (tenSecs > 9) {
        tenSecs = 0;
        seconds++;
        if (seconds > 59) {
            seconds = 0;
            minutes++;
            //assume no one will spend more than an hour on a minesweeper lmaoo
        }
    }
    
    //displaying the time
    var printSeconds;
    if (seconds < 10) {
        printSeconds = "0" + seconds;
    }
    else {
        printSeconds = "" + seconds;
    }
    
    var printMinutes;
    if (minutes < 10) {
        printMinutes = "0" + minutes;
    }
    else {
        printMinutes = "" + minutes;
    }
    
    displayTime.innerText = (printMinutes + ":" + printSeconds + "." + tenSecs);
    
    //perform the timeout
    timer();
}

function startCount(){
    if (timerOn !== true) {
        timer();
        timerOn = true;
    }
}

//function of start button
start.onclick = function(){
    startCount();
    // console.log("start timer");
};

//function of stop button
stop.onclick = function() {
    clearTimeout(t);
    timerOn = false;
    // console.log("stop timer");
};

//function of clear button
clear.onclick = function() {
    displayTime.innerText = "00:00.0";
    tenSecs = 0;
    seconds = 0;
    minutes = 0;
    // console.log("clear timer");
};

////////////////////////////////////////////////////////////////////////////////////////////////////

//set Alaska and Hawaii to start and reload, respectively
var alaska = document.getElementById("AK");
var hawaii = document.getElementById("HI");

var switchAK = false;
alaska.onclick = function(){
    startCount();
};

hawaii.onclick = function(){
    location.reload();
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//minesweeper fields

//Bordering states object (could put into JSON file)
var stateBorders = {
// 	"AK": [],
	"AL": ["TN", "GA", "FL", "MS"],
	"AR": ["MO", "TN", "MS", "LA", "TX", "OK"],
	"AZ": ["UT", "CO", "NM", "CA", "NV"],
	"CA": ["OR", "NV", "AZ"],
	"CO": ["WY", "NE", "KS", "OK", "NM", "AZ", "UT"],
	"CT": ["MA", "RI", "NY"],
// 	"DC": ["MD", "VA"],
	"DE": ["PA", "NJ", "MD"],
	"FL": ["GA", "AL"],
	"GA": ["NC", "SC", "FL", "AL", "TN"],
// 	"HI": [],
	"IA": ["MN", "WI", "IL", "MO", "NE", "SD"],
	"ID": ["MT", "WY", "UT", "NV", "OR", "WA"],
	"IL": ["WI", "IN", "KY", "MO", "IA"],
	"IN": ["MI", "OH", "KY", "IL"],
	"KS": ["NE", "MO", "OK", "CO"],
	"KY": ["OH", "WV", "VA", "TN", "MO", "IL", "IN"] ,
	"LA": ["AR", "MS", "TX"],
	"MA": ["NH", "RI", "CT", "NY", "VT"],
// 	"MD": ["PA", "DE", "DC", "VA", "WV"],
	"MD": ["PA", "DE", "VA", "WV"],
	"ME": ["NH"],
	"MI": ["OH", "IN", "WI"],
	"MN": ["WI", "IA", "SD", "ND"],
	"MO": ["IA", "IL", "KY", "TN", "AR", "OK", "KS", "NE"],
	"MS": ["TN", "AL", "LA", "AR"],
	"MT": ["ND", "SD", "WY", "ID"],
	"NC": ["VA", "SC", "GA", "TN"],
	"ND": ["MN", "SD", "MT"],
	"NE": ["SD", "IA", "MO", "KS", "CO", "WY"],
	"NH": ["ME", "MA", "VT"],
	"NJ": ["NY", "DE", "PA"],
	"NM": ["CO", "OK", "TX", "AZ", "UT"],
	"NV": ["ID", "UT", "AZ", "CA", "OR"],
	"NY": ["VT", "MA", "CT", "NJ", "PA"],
	"OH": ["PA", "WV", "KY", "IN", "MI"],
	"OK": ["KS", "MO", "AR", "TX", "NM", "CO"],
	"OR": ["WA", "ID", "NV", "CA"],
	"PA": ["NY", "NJ", "DE", "MD", "WV", "OH"],
	"RI": ["MA", "CT"],
	"SC": ["NC", "GA"],
	"SD": ["ND", "MN", "IA", "NE", "WY", "MT"],
	"TN": ["KY", "VA", "NC", "GA", "AL", "MS", "AR", "MO"],
	"TX": ["OK", "AR", "LA", "NM"],
	"UT": ["ID", "WY", "CO", "NM", "AZ", "NV"],
// 	"VA": ["MD", "DC", "NC", "TN", "KY", "WV"],
	"VA": ["MD", "NC", "TN", "KY", "WV"],
	"VT": ["NH", "MA", "NY"],
	"WA": ["ID", "OR"],
	"WI": ["MI", "IL", "IA", "MN"],
	"WV": ["PA", "MD", "VA", "KY", "OH"],
	"WY": ["MT", "SD", "NE", "CO", "UT", "ID"]
};

var stateList = Object.keys(stateBorders);  //List of states
var stateIndex = {};  // Object mapping state to their index
stateList.forEach((key, i) => stateIndex[key] = i);

//Generate mines (i.e. random states)
var mines = [];
// to prevent repeated mines
var usedNumbers = [];
for (var count = 0; count < mineCount; count++) {
    var nextRandom = Math.floor(Math.random()*stateList.length);
    while (usedNumbers.indexOf(nextRandom) > -1) {
        nextRandom = Math.floor(Math.random()*stateList.length);
    }
    usedNumbers.push(nextRandom);
	mines.push(stateList[nextRandom]);
}

console.log(mines);  //testing purposes

// determine how many mines border each state
// this is an object
var borderMines = stateList.reduce(function(output, elem){
    var tempStates = stateBorders[elem];
    var tempMines = 0;
    // for each bordering state to the current state, 
    // if the bordering state is one of the mines, then add 
    for (var i = 0; i < tempStates.length; i++) {
        nextState = tempStates[i];
        if (mines.indexOf(nextState) > -1){
            tempMines += 1;
        }
    }
    output.push(tempMines);
    return output;
}, []);

// console.log(borderMines);  //for testing

////////////////////////////////////////////////////////////////////////////////////////////////////
//actual minesweeper game

var stateSet = new Set(stateList);
var visitedStates = new Set();
var mineSet = new Set(mines);

// Reveal the number of mines (the bulk of the game)
function revealColor(ev) {
    startCount();
    console.log(ev);
    var state = ev.srcElement;
    // var stateElement = document.getElementById(state.id);  // actual DOM element
    
    // Change the color based on number of mines next to it
    var newClass;
    if (mines.indexOf(state.id) > -1) {
        state.style['fill'] = '#000000';
        state['textContent'] = "MINE";
        newClass = "mineSTEP";
        
        //stop the timer, reload the page
        clearTimeout(t);
        timerOn = false;
        alert("You detonated a mine, oops. Try again!");
        location.reload();
    }
    else {
        var numMines = borderMines[stateIndex[state.id]];
        switch (numMines) {
            case 0:
                state.style['fill'] = '#DEDEDC';
                // state['textContent'] = "0";
                newClass = "mine0";
                break;
            case 1:
                state.style['fill'] = '#DDFAC3';
                // state['textContent'] = "1";
                newClass = "mine1";
                break;
            case 2:
                state.style['fill'] = '#ECEDBF';
                // state['textContent'] = "2";
                newClass = "mine2";
                break;
            case 3:
                state.style['fill'] = '#EDDAB4';
                // state['textContent'] = "3";
                newClass = "mine3";
                break;
            case 4:
                state.style['fill'] = '#EDC38A';
                // state['textContent'] = "4";
                newClass = "mine4";
                break;
            case 5:
                state.style['fill'] = '#F7A1A2';
                // state['textContent'] = "5";
                newClass = "mine5";
                break;
            case 6:
                state.style['fill'] = '#FEA785';
                // state['textContent'] = "6";
                newClass = "mine6";
                break;
            case 7:
                state.style['fill'] = '#FF7D60';
                // state['textContent'] = "7";
                newClass = "mine7";
                break;
            case 8:
                state.style['fill'] = '#FF323C';
                // state['textContent'] = "8";
                newClass = "mine8";
                break;
        }
    }
    
    // alert("You clicked the state " + state.id);
    var stateID = document.getElementById(state.id);
    console.log(stateID);
    console.log(newClass);
    stateID.class = newClass;
    
    // notify when all mines have been detected (i.e. a win in the game)
    visitedStates.add(state.id);
    let unclicked = new Set([...stateSet].filter(x => !visitedStates.has(x)));
    let mineCheck = new Set([...unclicked].filter(x => !mineSet.has(x)));
    if (mineCheck.size === 0) {
        clearTimeout(t);
        timerOn = false;
        for (let i = 0; i < mines.length; i++) {
            let mineState = document.getElementById(mines[i]);
            mineState.setAttribute('style', 'fill: #000000');
        }
        alert("Congratulations, you won this Minesweeper! Please play again!");
    }
}

//make each state able to reveal the number of mines (or the mine itself)
var outlines = document.getElementById('outlines');
outlines.onclick = revealColor;
// Flags
outlines.oncontextmenu = function(ev) {
    var state = ev.srcElement;
    var statePath = document.getElementById(state.id);
    // if (state.style['fill'] == "") {
    //     state.style['fill'] == flagColor;
    // }
    // else if (state.style['fill'] == flagColor) {
    //     state.style['fill'] == "#AAA";
    // }
    if (state.style['fill'] == "rgb(12, 105, 232)") {
        state.style="#f0f0f0";
    }
    else {
        state.style['fill'] = flagColor;
    }
    // state.style['fill'] = flagColor;
    console.log(state);
    return false;     // cancel default menu
};

////////////////////////////////////////////////////////////////////////////////////////////////////

//written by 2019aliu
//end of file

