/* Student ID: UP864163 */

/* 1 */
'use strict';
const express = require('express');
const app = express();
const imager = require('./imager');
const port = 8080;

/* Statistics */
let recentPaths = [];
let recentTexts = [];
let recentSizes = [];

/* Check if string is blank */
function isBlank(str){
    return (!str || /^\s*$/.test(str));
}

/*
   Validate width, height, square and text.
   Params: req - Express.js request object
   Returns: Status response code
*/
function getErrorStatus(req){
    let width = Number(req.params.width);
    let height = Number(req.params.height);
    let length = Object.keys(req.query).length;
    let square = req.query.square;

    if (!Number.isInteger(width) || !Number.isInteger(height) || width == NaN || height == NaN){
        return 404;
    } else if (height > 2000 || width > 2000){
        return 403;
    } else if (height < 1 || width < 1){
        return 404;
    } else if (width == null || width == null){
        return 404;
    } else if (square == "") {
        return 400;
    } else if (square && (square <= 0 || square % 1 !== 0)) {
        return 400;
    }
    return 200;
}

/*
    Take the item at index to the front and shuffle the rest of the elements down
*/
function bringForwards(arr, index){
    let temp = arr[index]
    arr.splice(index, 1)
    arr.unshift(temp)
}

/* Remove duplicate paths */
function removeDuplicatePaths(width, height, square, text){
    let duplicates = false;
    for (let i = 0; i <= recentPaths.length; i++){
        let path = recentPaths[i];
        if (path && width == path.width && height == path.height && square == path.square && text == path.text) {
            bringForwards(recentPaths, i);
            duplicates = true;
        }
    }
    return duplicates;
}

/* Remove duplicate texts */
function removeDuplicateTexts(text){
    let dup = false;
    for (let i = 0; i <= recentTexts.length; i++){
        let txt = recentTexts[i];
        if (txt == text){
            bringForwards(recentTexts, i);
            dup = true;
        }
    }
    return dup;
}

/* Remove duplicate sizes */
function removeDuplicateSizes(width, height){
    let duplicates = false;
    for (let i = 0; i <= recentSizes.length; i++){
        let size = recentSizes[i];
        if (size && size.w == width && size.h == height){
            bringForwards(recentSizes, i);
            duplicates = true;
        }
    }
    return duplicates;
}

/* Store path to array removing duplicates */
function saveRecentPath(width, height, square, text){
    let path = {width: width, height: height, square: square, text: text}
    if (!removeDuplicatePaths(width, height, square, text)){
        recentPaths.unshift(path);
    }

    if (recentPaths.length > 10) {
        recentPaths.pop();
    }
}

/* Store text to array removing duplicates */
function saveRecentText(text){

    if (text && !removeDuplicateTexts(text)){
        recentTexts.unshift(text);
    }

    if (recentTexts.length > 10){
        recentTexts.pop();
    }
}

/* Store width and height to array removing duplicates */
function saveRecentSize(width, height){
    let size = {w: width, h: height};
    if (!removeDuplicateSizes(width, height)){
        recentSizes.unshift(size);
    }

    if (recentSizes.length > 10) {
        recentSizes.pop();
    }
}

/* Send 10 of the most recent paths */
function requestRecentPaths(req, res){
    let paths = [];

    recentPaths.forEach(path => {
        if (path) {
            let width = path.width
            let height = path.height
            let square = path.square
            let text = path.text

            if (square && text){
                paths.push("/img/" + width + "/" + height + "?square=" + square + "&text=" + encodeURIComponent(text))
            } else if (text && square == null){
                paths.push("/img/" + width + "/" + height + "?text=" + encodeURIComponent(text))
            } else if (!text && square !== null){
                paths.push("/img/" + width + "/" + height + "?square=" + square)
            } else {
                paths.push("/img/" + width + "/" + height)
            }
        }
    });

    res.send(paths);
}

/* Send 10 of the most recent texts */
function requestRecentTexts(req, res){
    res.send(recentTexts);
}

/* Send 10 of the most recent sizes */
function requestRecentSizes(req, res){
    res.send(recentSizes);
}

/* Send image on request */
function requestImage(req, res){
    let status = getErrorStatus(req);

    if (status == 200){
        /* NOTE: Default square value is null */
        let square = (req.query.square) ? parseInt(req.query.square) : null;
        square = (square == 0) ? null : square;

        /* NOTE: Default text value is false */
        let text = req.query.text;
        text = text || !isBlank(text);

        let width = Number(req.params.width);
        let height = Number(req.params.height);

        /* Debug */
        console.log("====================")
        console.log("Width: " + width);
        console.log("Height: " + height);
        console.log("Sqr: " + square);
        console.log("Txt: " + text);
        console.log("=================== ")
        saveRecentPath(width, height, square, text);
        saveRecentSize(width, height);
        saveRecentText(text);
        imager.sendImage(res, width, height, square, text);

    } else {
        res.sendStatus(status);
    }
}

/* Route static files */
app.use('/',express.static('public'));
/* Handle recent paths API */
app.get('/stats/paths/recent', requestRecentPaths);
/* Handle recent texts API */
app.get('/stats/texts/recent', requestRecentTexts);
/* Handle recent sizes API */
app.get('/stats/sizes/recent', requestRecentSizes);
/* Handle image requests API*/
app.get('/img/:width/:height', requestImage);
/* Start node js server & listen on port */
app.listen(port);
