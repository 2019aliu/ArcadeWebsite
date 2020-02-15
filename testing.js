#!/usr/bin/nodejs

// load package
var mysql = require('mysql');
 

// create a connection pool
//  - this allows for multiple connections to occur without incurring 'startup costs' 
//    (these costs are time costs for setting up a db connection)
//    it allows a connection to your db to be reused among subsequent users.
var pool  = mysql.createPool({
  connectionLimit : 10,
  user            : 'site_2019aliu',
  password        : 'WFELBpgZ5CbbDMpZapEQNEXq',
  host            : 'mysql1.csl.tjhsst.edu',
  port            : 3306,
  database        : 'site_2019aliu'
});

// perform a query and get the result in javascript
pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;

  // a) the results are returned as an array
  // b) if you specify an alias via 'AS', then the result gets in a key by that name
  console.log('The solution is: ', results[0].solution);
    
  // the pool keeps node's event loop alive;
  //  - while this is great news for a server, in this standalone context 
  //    it that means that node will hang until you ctrl-c your node process
  //    to prevent this hanging behavior, the following is implemented

  // THE FOLLOWING IS A TOTAL HACK TO CLOSE THE POOL THAT WOULD .NEVER. 
  //   APPEAR HERE IN AN ACTUAL SERVER

  pool.end(); //terminate the pool when the first asyncrhonous pool.query finishes
});






// var string = "asdf, asdf sdfg,sdfg,  sdfghhjk";
// console.log(string.split(", "));

// // function letterPosMatch(curr, idx){
// //     return curr[this.index] === this.letter;
// // }

// // function filterWords(words, letterObj) {
// //     var ret = [...words];
// //     for (var condition in letterObj){
// //         console.log(condition, letterObj[condition]);
// //         ret = ret.filter(word => letterPosMatch(word), {
// //             "index": condition,
// //             "letter": letterObj[condition]
// //         });
// //         console.log(ret);
// //     }
// //     return ret;
// //     // return letterObj.reduce(function())
// // }

// // ///////////////////////// Import statements /////////////////////////

// // // Imported stuff
// // var fs = require('fs');  // import file systems

// // ///////////////////////// File I/O  /////////////////////////

// // // make the dictionary of words
// // // Order: get file, make a string out of all words, split by \n, split by \r, get rid of all empty spaces
// // var wordList = fs.readFileSync(__dirname + '/ScrabbleFiles/wordsWithFriends.txt').toString().split("\n").join("\r").split("\r").filter(function(word){
// //     return word !== "";
// // });

// // // make dictionary of points
// // // same order as before (referencing the parsing of word List)
// // var scrabbleListRAW = fs.readFileSync(__dirname + '/ScrabbleFiles/scrabbleLetters.txt').toString().split("\n").join("\r").split("\r").filter(function(word){
// //     return word !== "";
// // });

// // // split all items into list
// // var scrabbleList = scrabbleListRAW.map(x => x.split(" "));

// // // make object of point values for each letter
// // var scrabblePoints = scrabbleList.reduce(function(output, elem){
// //     output[elem[0].toLowerCase()] = parseInt(elem[2]);
// //     return output;
// // }, {});

// // // make frequency distribution for the letters 
// // var scrabbleFreq = scrabbleList.reduce(function(output, elem){
// //     output[elem[0].toLowerCase()] = parseInt(elem[1]);
// //     return output;
// // }, {});

// // var scrabbleFcns = require('./js/wordSearch.js');
// // var testLetters = "avocado".toLowerCase().split("");
// // var testWords = [...wordList];
// // var allWords = scrabbleFcns.wordSearch(testLetters, testWords);
// // // console.log(allWords);
// // var filteredWords = filterWords(allWords, {0: 'a', 3: 'c'});
// // console.log(filteredWords);
// // // console.log(generatePoints(testLetters, allWords, scrabblePoints));


// // // var myArray = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 0, 0];
// // // var counter = 0;
// // // for (var i = 0; i < 5; i++) {
// // //     for (var j = 0; j < 6; j++) {
// // //         console.log(myArray[counter]);
// // //         counter++;
// // //     }
// // // }

// // // var testarray = ["a", "b", "c", "?", "?", "d"];
// // // // var newArray = [...testarray];
// // // // newArray[0] = "banana";
// // // // console.log(testarray);
// // // // console.log(newArray);
// // // var numWilds = testarray.filter(x => x==="?").length;
// // // console.log(numWilds)

// // // // var testar = [1, 2, 3];
// // // // console.log(new Set(testar));


// // // // var testStr = "testing";
// // // // console.log(typeof testStr.charAt(0));
// // // // console.log(testStr.split(""));


// // // // function resolveAfter2Seconds() {
// // // //   return new Promise(resolve => {
// // // //     setTimeout(() => {
// // // //       resolve('resolved');
// // // //     }, 2000);
// // // //   });
// // // // }

// // // // async function asyncCall() {
// // // //   console.log('calling');
// // // //   var result = await resolveAfter2Seconds();
// // // //   console.log(result);
// // // //   // expected output: 'resolved'
// // // // }

// // // // asyncCall();














// // // // var path = require('path');
// // // // var x = path.join(__dirname, "..", "foo.js"); // 
// // // // console.log(x)
// // // // console.log(typeof "lol" == "string")

// // // // raybai = {};
// // // // raybai["a"] = "avocado";
// // // // console.log(raybai["a"]);


// // // // testObj = {};
// // // // testObj["cool"] = "foo";
// // // // console.log(testObj.cool);

// // // // s1 = "asdf";
// // // // console.log("jkl;" + s1);

// // // /*
// // // @author ALiu
// // // Client side js
// // // This is where all fo the magic happens
// // // */

// // // // //Bordering states object (could put into JSON file)
// // // // var stateBorders = {
// // // // 	"AK": [],
// // // // 	"AL": ["TN", "GA", "FL", "MS"],
// // // // 	"AR": ["MO", "TN", "MS", "LA", "TX", "OK"],
// // // // 	"AZ": ["UT", "CO", "NM", "CA", "NV"],
// // // // 	"CA": ["OR", "NV", "AZ"],
// // // // 	"CO": ["WY", "NE", "KS", "OK", "NM", "AZ", "UT"],
// // // // 	"CT": ["MA", "RI", "NY"],
// // // // 	"DC": ["MD", "VA"],
// // // // 	"DE": ["PA", "NJ", "MD"],
// // // // 	"FL": ["GA", "AL"],
// // // // 	"GA": ["NC", "SC", "FL", "AL", "TN"],
// // // // 	"HI": [],
// // // // 	"IA": ["MN", "WI", "IL", "MO", "NE", "SD"],
// // // // 	"ID": ["MT", "WY", "UT", "NV", "OR", "WA"],
// // // // 	"IL": ["WI", "IN", "KY", "MO", "IA"],
// // // // 	"IN": ["MI", "OH", "KY", "IL"],
// // // // 	"KS": ["NE", "MO", "OK", "CO"],
// // // // 	"KY": ["OH", "WV", "VA", "TN", "MO", "IL", "IN"] ,
// // // // 	"LA": ["AR", "MS", "TX"],
// // // // 	"MA": ["NH", "RI", "CT", "NY", "VT"],
// // // // 	"MD": ["PA", "DE", "DC", "VA", "WV"],
// // // // 	"ME": ["NH"],
// // // // 	"MI": ["OH", "IN", "WI"],
// // // // 	"MN": ["WI", "IA", "SD", "ND"],
// // // // 	"MO": ["IA", "IL", "KY", "TN", "AR", "OK", "KS", "NE"],
// // // // 	"MS": ["TN", "AL", "LA", "AR"],
// // // // 	"MT": ["ND", "SD", "WY", "ID"],
// // // // 	"NC": ["VA", "SC", "GA", "TN"],
// // // // 	"ND": ["MN", "SD", "MT"],
// // // // 	"NE": ["SD", "IA", "MO", "KS", "CO", "WY"],
// // // // 	"NH": ["ME", "MA", "VT"],
// // // // 	"NJ": ["NY", "DE", "PA"],
// // // // 	"NM": ["CO", "OK", "TX", "AZ", "UT"],
// // // // 	"NV": ["ID", "UT", "AZ", "CA", "OR"],
// // // // 	"NY": ["VT", "MA", "CT", "NJ", "PA"],
// // // // 	"OH": ["PA", "WV", "KY", "IN", "MI"],
// // // // 	"OK": ["KS", "MO", "AR", "TX", "NM", "CO"],
// // // // 	"OR": ["WA", "ID", "NV", "CA"],
// // // // 	"PA": ["NY", "NJ", "DE", "MD", "WV", "OH"],
// // // // 	"RI": ["MA", "CT"],
// // // // 	"SC": ["NC", "GA"],
// // // // 	"SD": ["ND", "MN", "IA", "NE", "WY", "MT"],
// // // // 	"TN": ["KY", "VA", "NC", "GA", "AL", "MS", "AR", "MO"],
// // // // 	"TX": ["OK", "AR", "LA", "NM"],
// // // // 	"UT": ["ID", "WY", "CO", "NM", "AZ", "NV"],
// // // // 	"VA": ["MD", "DC", "NC", "TN", "KY", "WV"],
// // // // 	"VT": ["NH", "MA", "NY"],
// // // // 	"WA": ["ID", "OR"],
// // // // 	"WI": ["MI", "IL", "IA", "MN"],
// // // // 	"WV": ["PA", "MD", "VA", "KY", "OH"],
// // // // 	"WY": ["MT", "SD", "NE", "CO", "UT", "ID"]
// // // // };

// // // // var stateList = Object.keys(stateBorders);  //List of states
// // // // var stateIndex = {};  // Object mapping state to their index
// // // // stateList.forEach((key, i) => stateIndex[key] = i);
// // // // console.log(stateIndex);

