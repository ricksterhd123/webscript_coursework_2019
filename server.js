'use strict';
const express = require('express')
const imager = require('./imager/imager.js')
const app = express()
const port = 8080

app.use('/', express.static('public'))
app.get('/', function (req, res) { res.send('wew') })
app.listen(port)
