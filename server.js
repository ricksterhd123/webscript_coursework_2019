'use strict';

const express = require('express');
const app = express();
const imager = require('./imager');
const port = 8080;

/* Check if n is an integer */
function isInteger(n){
    return Number.isInteger(n) && Number(n) === n && n % 1 === 0;
}

/* Routing static files */
app.use('/',express.static('public'));
/* Start node js server & listen on port */
app.listen(port);

/* Sending an image */
app.get('/img/:width/:height', function(req, res){
    let width = Number(req.params.width)
    let height = Number(req.params.height)
    let square = req.query.square
    console.log(square)
    console.log(Number(square))
    let status = getErrorStatus(width, height, square)

    if (status == 200){
        imager.sendImage(res, width, height, square);
    } else {
        res.sendStatus(status)
    }

});

/*
   Validate width, height, square and text
   Returns: true if valid, false otherwise
*/
function getErrorStatus(width, height, square){

    if (!Number.isInteger(width) || !Number.isInteger(height) || width == NaN || height == NaN){
        return 404
    } else if (height > 2000 || width > 2000){
        return 403
    } else if (height < 1 || width < 1){
        return 404
    } else if (width == null || width == null){
        return 404
    } else if (square && (square == 0 || !Number.isInteger(Number(square)))) {
        return 400
    }
    return 200
}
