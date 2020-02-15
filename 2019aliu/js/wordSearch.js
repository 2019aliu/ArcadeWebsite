/*
@author ALiu
@date 10/30/18
Purpose: make words out of letters
*/


///////////////////////// Import statements /////////////////////////

// Imported stuff
var fs = require('fs');  // import file systems

///////////////////////// File I/O  /////////////////////////

// make the dictionary of words
// Order: get file, make a string out of all words, split by \n, split by \r, get rid of all empty spaces
var wordList = fs.readFileSync(__dirname + '/../ScrabbleFiles/wordsWithFriends.txt').toString().split("\n").join("\r").split("\r").filter(function(word){
    return word !== "";
});

// make dictionary of points
// same order as before (referencing the parsing of word List)
var scrabbleListRAW = fs.readFileSync(__dirname + '/../ScrabbleFiles/scrabbleLetters.txt').toString().split("\n").join("\r").split("\r").filter(function(word){
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

///////////////////////// Primary functions /////////////////////////

// Method to search for all words matching a specific case
// Input: list of letters, list of words to choose from
// Output: all words that can be formed from the letters given
function wordSearch(letters, words){
    var noWilds = letters.filter(x => x!=="?");  // maybe parse this better?
    var numWilds = letters.length - noWilds.length;
    return words.reduce(function(wordList, currWord){
        // might need to add this:
        var tempLetters = [...noWilds];
        let wordChars = currWord.split("");
        
        // THIS PART LOOKS SO UGLY
        let charDiff = [];
        for (var i = 0; i < wordChars.length; i++) {
            let wChar = wordChars[i];
            if (tempLetters.indexOf(wChar) < 0) {
                charDiff.push(wChar);
            }
            else {
                delete tempLetters[tempLetters.indexOf(wChar)];
            }
        }

        if (charDiff.length <= numWilds) {
            wordList.push(currWord);
        }
        return wordList;
    }, []);
}

// Method to sort point values for each word
// Input: list of letters where words came from (this is for determining wild cards), list of words, points per letter dictionary
// NOTE: THE WORDS OBJECT IS ASSUMED TO BE FILTERED CORRECTLY, OTHERWISE THIS METHOD IS NOT EFFECTIVE
// Output: object mapping words to their appropriate points
function generatePoints(letters, words, pointValues) {
    var noWilds = letters.filter(x => x!=="?"); // maybe parse this better?
    return words.reduce(function(pointsObj, currWord){
        let tempScore = 0;
        for (var index = 0; index < currWord.length; index++) {
            if (letters.indexOf(currWord[index]) > -1) {
                tempScore += pointValues[currWord[index]];
            }
        }
        pointsObj[currWord] = tempScore;
        return pointsObj;
    }, {});
}

// Method: sort through all words with letters at given indexes
// Input: words to pass through filter, object of index-character pairs
// Output: list with filtered words
function filterWordsLI(words, letterObj) {
    var ret = [...words];
    for (var condition in letterObj){  // this can be more efficient...
        ret = ret.filter(word => word[condition] === letterObj[condition]);
    }
    return ret;
}


// Method: sort through all words with containing letters
// Input: words to pass through filter, list of letters to contain
// Output: list of filtered words
// NOTE: I chose probably the worst method names, oops
function filterWordsL(words, letterList) {
    var ret = [...words];
    for (var i = 0; i < letterList.length; i++) {
        ret = ret.filter(word => word.indexOf(letterList[i]) > -1);
    }
    return ret;
}

///////////////////////// Testing (the "driver") /////////////////////////

// var testLetters = ['t', 'e', 's', 't', 'i', 'n', 'g', '?'];
// var testWords = ["testtt", "sing", "sang"];

var testLetters = "avocad?".toLowerCase().split("");
var testWords = [...wordList];
var allWords = wordSearch(testLetters, testWords);
// console.log(allWords);
var filteredWords = filterWordsLI(allWords, {0: 'a', 3: 'c'});
// console.log(filteredWords);
var filteredWordsV2 = filterWordsL(allWords, ['a', 'c']);
// console.log(filteredWordsV2);
// console.log(generatePoints(testLetters, allWords, scrabblePoints));

///////////////////////// Export functions /////////////////////////

module.exports.wordSearch = wordSearch;
module.exports.generatePoints = generatePoints;
module.exports.filterWordsLI = filterWordsLI;

// Program written by { 2019aliu }
//end of file

/////////////////////////////////////////////////////////////////////////////////////////

// ///////////////////////// Helper functions /////////////////////////
// // mainly just a bunch of function to just "tag" in a filter

// // This will filter all words greater than specified length in "this"
// function lengthGreater(curr, idx){
//     return curr.length > this;
// }

// // This will filter all words less than specified length in "this"
// function lengthLess(curr, idx){
//     return curr.length < this;
// }

// // This will filter all words at the specified length in "this" (probably not needed anymore)
// function lengthEqual(curr, idx){
//     return curr.length === this;
// }
// // This will filter all words with the letter specified by "this" at the specified index by "this"
// // Must give letter and position of letter to match
// function letterPosMatch(curr, idx){
//     return curr[this.index] === this.letter;
// }

