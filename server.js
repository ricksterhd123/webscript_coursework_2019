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
        let invalid = height < 0 || height > 2000 || width  < 0 || width  > 20000
        if (invalid) {res.send(403)} else {imager.sendImage(res, width, height)}
    }
)
app.listen(port)
