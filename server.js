'use strict';
const express = require('express')
const imager = require('./imager/imager.js')
const app = express()
const port = 8080

app.use('/', express.static('public'))
app.get('/img/:width/:height',
    function (req, res)
    {
        let width = req.params.width
        let height = req.params.height
        let invalid = height < 1 || height > 2000 || width  < 1 || width  > 2000
        console.log(width)
        console.log(height)
        if (invalid) {res.sendStatus(403)} else {imager.sendImage(res, width, height, req.query.square, req.query.text)}
    }
)
app.listen(port)
