/*
THIS IS THE V2 OF DOSTATEFCNS
@author ALiu
@date 08/30/18
Purpose: states functions (1st assignment!)
Log:    0830-2242: Everything seems to work, now testing
        0830-2314: function processState does NOT work, needs work
        0831-1502: Found the bug (didn't use the lowercased index when access the nameToAbbrList object), everything seems to work now
        
*/

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* File I/O:
Setting up all of the fields (imo this is the bulk of the work)
*/

// Process state name to state abbreviation txt file

var fs = require('fs');  // Import statements use "require"
var nameToAbbrRAW = fs.readFileSync(__dirname + '/statesNamesToAbbr.txt').toString();  // This is the string from text file (it's one string though, need parsing)
var nameToAbbrRAWList = nameToAbbrRAW.split("\n");  // first delimit with newline
var nameToAbbrList = nameToAbbrRAWList.reduce(function(output, item){  // then split up each string into name --> abbreviation pairs
    var allParts = item.split(" ");  // first split up the item (so statename (maybe two words), the dash, and the abbreviation)
    var stateName = allParts.slice(0, allParts.length-2).join(" ").toLowerCase();  // get the statename
    var stateAbbr = allParts.slice(-1)[0];  // get the state abbreviation
    output[stateName] = stateAbbr;  // make a new output pair
    return output;  // MUST do this to update the object being returned
}, {} );

// Process state borders file -- similar to the file processing for the state abbreviation file processing

var fs = require('fs');
var stateBordersRAW = fs.readFileSync(__dirname + '/stateBordersTEST.txt').toString();
var stateBordersRAWList = stateBordersRAW.split("\n");
var borderObj = stateBordersRAWList.reduce(function(output, abbrvs){
    var allAbbr = abbrvs.split(" ");
    var keyState = allAbbr[0];
    var valueStates = allAbbr.slice(1);
    output[keyState] = valueStates;
    return output;
}, {});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Functions required of the assignment

// Create an adjacency matrix for a provided dictionary (it's an object, but it's essentially a dictionary)
function makeAdjMat(myObj){
    var myKeys = Object.keys(myObj);  // get the keys of dictionary
    var adjMat = myKeys.reduce(function(output, elem){  // creating the adjacency matrix
        // keep in mind myObj[elem] is the list of states that border elem
        var stateBorderArr = myKeys.map(function(state) {
            return myObj[elem].indexOf(state) > -1;
        });
        output[elem] = stateBorderArr;
        return output;
    }, {});
    return adjMat;
}

// Get the bordering states of an input state
function getStatesBorder(state){
    var convertedState = processState(state);
    if (convertedState == "INVALID STATE"){
        return "Some input is not right. Please try again.";
    }
    return borderObj[convertedState];
}

// Determine whether two given states border each other
function doStatesBorder(state1, state2){
    var convertedState1 = processState(state1);
    var convertedState2 = processState(state2);
    if (convertedState1 == "INVALID STATE"){
        return "Some input is not right. Please try again.";
    }
    if (convertedState2 == "INVALID STATE"){
        return "Some input is not right. Please try again.";
    }
    return borderObj[convertedState1].indexOf(convertedState2) > -1;
}

// process the input of state1, return as state abbreviation (if input is valid)
// NOTE: JS short circuits if-statements, so if a condition isn't true, it doesn't bother checking the ones after
function processState(state){
    if (Object.keys(borderObj).indexOf(state) > -1){
        return state;
    }
    if (Object.keys(nameToAbbrList).indexOf(state.toLowerCase()) > -1){
        return nameToAbbrList[state.toLowerCase()];
    }
    return "INVALID STATE";
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* Testing area
Test all methods
*/

// console.log(makeAdjMat(borderObj));
// console.log(getStatesBorder("viRginiA"));
// console.log(getStatesBorder("alaska"));
// console.log(doStatesBorder("maIne", "nEw York"));
// console.log(doStatesBorder("NJ", "pa"));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.getBorder = getStatesBorder;
module.exports.sharesBorder = doStatesBorder;

// Program written by: { 2019aliu }
//end of file
