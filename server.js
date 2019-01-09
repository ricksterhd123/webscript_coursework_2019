/* Student ID: UP864163 */
'use strict';
const express = require('express');
const app = express();
const imager = require('./imager');
const port = 8080;

/* Statistics */
let recentPaths = [];
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

/*
   Check if the path exists (i.e. recent)
   Returns: index from array 'recentPaths', false if path does not exist.
*/
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

/*
    Check if the size exists
    Returns: index from array, false otherwise.
*/
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


/* Save the recent path */
function saveRecentPath(width, height, square, text){
    let path = {width: width, height: height, square: square, text: text}
    if (!removeDuplicatePaths(width, height, square, text)){
        recentPaths.unshift(path);
    } else if (recentPaths.length > 10) {
        recentPaths.pop();
    }
    console.log(recentPaths)
}

/* Store size to array */
function saveRecentSize(width, height){
    let size = {w: width, h: height};
    if (!removeDuplicateSizes(width, height)){
        recentSizes.unshift(size);
    } else if (recentSizes.length > 10) {
        recentSizes.pop();
    }
    console.log(recentSizes)
}

/* Send 10 of the most recent paths back */
function requestRecentPaths(req, res){
    let paths = [];

    recentPaths.forEach(path => {
        if (path) {
            let width = path.width
            let height = path.height
            let square = path.square
            let text = path.text

            if (square !== null && text){
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
        imager.sendImage(res, width, height, square, text);

    } else {
        res.sendStatus(status);
    }
}

/* Route static files */
app.use('/',express.static('public'));
/* Handle recent paths API */
app.get('/stats/paths/recent', requestRecentPaths);
/* Handle recent sizes API */
app.get('/stats/sizes/recent', requestRecentSizes);
/* Handle image requests API*/
app.get('/img/:width/:height', requestImage);
/* Start node js server & listen on port */
app.listen(port);
