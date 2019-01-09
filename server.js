/* Student ID: UP864163 */
'use strict';
const express = require('express');
const app = express();
const imager = require('./imager');
const port = 8080;
let recentPaths = [];

/* Check if string is blank */
function isBlank(str){
    return (!str || /^\s*$/.test(str));
}

function copy(mainObj) {
  let objCopy = {}; // objCopy will store a copy of the mainObj
  let key;

  for (key in mainObj) {
    objCopy[key] = mainObj[key]; // copies each property to the objCopy object
  }
  return objCopy;
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
        console.log("square error")
        return 400;
    }
    return 200;
}

/*
   Check if the path exists (i.e. recent)
   Returns: index from array 'recentPaths', false if path does not exist.
*/
function isPathRecent(width, height, square, text){
    for (let i = 0; i <= recentPaths.length; i++){
        let path = recentPaths[i];
        if (path && width == path['width'] && height == path['height'] && square == path['square'] && text == path['text']) {
            return i;
        }
    }
    return false;
}

/*
    Take the item at index to the front and shuffle the rest of the elements down
*/
function bringPathForwards(index){
    let temp = recentPaths[index]
    recentPaths.splice(index, 1)
    recentPaths.unshift(temp)
}

/* Save the recent path */
function saveRecentPath(width, height, square, text){
    /* Move the path to the front if path already exists */
    let pathIndex = isPathRecent(width, height, square, text);
    if (pathIndex){
        bringPathForwards(pathIndex)
        console.log(recentPaths)
        return;
    }
    let path = {'width': 0, 'height': 0, 'square': null, 'text': false}
    path['width'] = width
    path['height'] = height
    path['square'] = square
    path['text'] = text
    recentPaths.unshift(copy(path))
    if (recentPaths.length > 10) {
        recentPaths.pop()
    }
    console.log(recentPaths)
    return true;
}

/* Send 10 of the most recent paths back */
function requestRecentPaths(req, res){
    let paths = [];
    console.log("Length: " + recentPaths.length)
    for (let i = 0; i <= recentPaths.length; i++){
        let path = recentPaths[i]
        if (path) {
            let width = path['width']
            let height = path['height']
            let square = path['square']
            let text = path['text']

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
    }

    res.send(paths)
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
        saveRecentPath(width, height, square, text)
        imager.sendImage(res, width, height, square, text);

    } else {
        res.sendStatus(status);
    }
}

/* Route static files */
app.use('/',express.static('public'));
/* Handle recent paths API*/
app.get('/stats/paths/recent', requestRecentPaths);
/* Handle image requests API*/
app.get('/img/:width/:height', requestImage);
/* Start node js server & listen on port */
app.listen(port);
