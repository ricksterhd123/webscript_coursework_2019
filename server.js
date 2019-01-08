/* Student ID: UP864163 */
'use strict';
const express = require('express');
const app = express();
const imager = require('./imager');
const port = 8080;

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

/* Send image on request */
function requestImage(req, res){
    let status = getErrorStatus(req);

    if (status == 200){
        let square = parseInt(req.query.square)
        square = (isNaN(square) || square == 0) ? null : square;    /* default value is null */

        let text = req.query.text;
        text = text || !isBlank(text);                              /* default value is false */

        let width = Number(req.params.width);
        let height = Number(req.params.height);

        /* Debug */
        console.log("Width: " + width)
        console.log("Height: " + height)
        console.log("Sqr: " + square)
        console.log("Txt: " + text)

        imager.sendImage(res, width, height, square, text);
    } else {
        res.sendStatus(status);
    }
}

/* Route static files */
app.use('/',express.static('public'));
/* Handle image requests */
app.get('/img/:width/:height', requestImage);
/* Start node js server & listen on port */
app.listen(port);
