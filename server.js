/* Student ID: UP864163 */
'use strict';
const express = require('express');
const app = express();
const imager = require('./imager');
const port = 8080;
let recentPaths = [];

/* Check if n is an integer */
function isInteger(n){
    return (Number.isInteger(n) && Number(n) === n && n % 1 === 0);
}

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
    } else if (length > 0 && square == undefined) {
        return 400;
    } else if (square !== undefined && (square <= 0 || square % 1 !== 0)) {
        return 400;
    }
    return 200;
}

function isPathRecent(width, height, square, text){
    for (let i = 0; i <= recentPaths.length; i++){
        var path = recentPaths[i];
        if (path && width == path['width'] && height == path['height'] && square == path['square'] && text == path['text']) {
            return true;
        }
    }
    return false;
}

/* Save the recent path */
function saveRecentPath(width, height, square, text){
    if (isPathRecent(width, height, square, text)){
        return false;
    }

    let path = {'width': 0, 'height': 0, 'square': null, 'text': false}
    path.width = width
    path.height = height
    path.square = square
    path.text = text
    recentPaths.unshift(path)
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
        let square = parseInt(req.query.square);
        square = (isNaN(square) || square == 0) ? null : square;    /* default value is null */

        let text = req.query.text;
        text = text || !isBlank(text);                              /* default value is false */

        let width = Number(req.params.width);
        let height = Number(req.params.height);

        /* Debug */
        console.log("Width: " + width);
        console.log("Height: " + height);
        console.log("Sqr: " + square);
        console.log("Txt: " + text);

        imager.sendImage(res, width, height, square, text);
        saveRecentPath(width, height, square, text)
    } else {
        res.sendStatus(status);
    }
}


/* Route static files */
app.use('/',express.static('public'));
/* Handle image requests API*/
app.get('/img/:width/:height', requestImage);
/* Handle recent paths API*/
app.get('/stats/paths/recent', requestRecentPaths);
/* Start node js server & listen on port */
app.listen(port);
