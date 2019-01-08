'use strict';

const express = require('express');
const app = express();
const imager = require('./imager');
const port = 8080;

/* Check if n is an integer */
function isInteger(n){
    return Number.isInteger(n) && Number(n) === n && n % 1 === 0;
}

/* Check if a given string is blank */
function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

/*
   Validate width, height, square and text
   Returns: true if valid, false otherwise
*/
function getErrorStatus(req){
    let width = Number(req.params.width)
    let height = Number(req.params.height)
    let length = Object.keys(req.query).length
    let square = req.query.square


    if (!Number.isInteger(width) || !Number.isInteger(height) || width == NaN || height == NaN){
        return 404
    } else if (height > 2000 || width > 2000){
        return 403
    } else if (height < 1 || width < 1){
        return 404
    } else if (width == null || width == null){
        return 404
    } else if (length > 0 && square == undefined) {
        return 400
    } else if (square !== undefined && (square <= 0 || square % 1 !== 0)) {
        return 400
    }
    return 200
}

/* Routing static files */
app.use('/',express.static('public'));
/* Start node js server & listen on port */
app.listen(port);

/* Sending an image */
app.get('/img/:width/:height', function(req, res){
    let status = getErrorStatus(req)
    if (status == 200){
        imager.sendImage(res, Number(req.params.width), Number(req.params.height), req.query.square, req.query.text);
    } else {
        res.sendStatus(status)
    }

});
