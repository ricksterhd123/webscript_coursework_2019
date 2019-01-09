'use strict';

//Import modules + port variable:
const port = 8080;
const express = require('express');
const app = express();
const imager = require('./imager');
const url = require("url");

//Accesses the public folder:
app.use('/', express.static('public'));

//Arrays for storing past requests/data:
let RecentPaths = [];
let RecentSizes = [];
let TopSizes = [];
let RecentTexts = [];

app.get('/', function (req, res) {
	res.sendFile(__dirname + "/public")
})



/////////
app.listen(port, console.log('Server running on port: ' + port));

app.get('/img/:width/:height', function (req, res) {
  //Creates variables for each image parameter:
  let height = Number(req.params.height);
  let width = Number(req.params.width);
  let square = req.query.square;
  let text = req.query.text;

  //Validation for the height and width parameters:
  if (height % 1 !== 0 || height == NaN) {
    return res.status(400).send('Error: Height must be a positive integer.');
  };
  if (width % 1 !== 0 ||  width == NaN) {
    return res.status(400).send('Error: Width must be a positive integer.');
  };
  if (height > 2000 || width > 2000) {
    return res.status(403).send('Error: Height/Width cannot be greater than 2000.');
  };
  if (height <= 0 || width <= 0) {
    return res.status(400).send('Error: Size cannot be less than 1.');
  };

  //Validation for the square parameter:
  if (square <= 0) {
    return res.status(400).send('Error: Square must be a positive integer value.');
  } else if (square % 1 == 0) {
    square = parseInt(square);
  } else if (square !== undefined) {
      return res.status(400).send('Error: Square must be a positive integer value.');
  }

  	imager.sendImage(res, width, height, square, text);

/////////////////////////////////////////////////////////////////////////////////////////////////////
	let textComp = ("text=" + encodeURIComponent(text));
  let squareComp = ("?square=" + square);

  if(typeof square != 'number' && (typeof text != "undefined" || text !== '')){
    textComp = ("?"+textComp);
  } else if(typeof square == 'number' && (typeof text != "undefined" || text !== '')){
    textComp = ("&"+textComp);
  };
  if(typeof square != 'number'){
    squareComp = "";
  }
  if(typeof text == "undefined" || text === ''){
    textComp = "";
  };

//CHANGE 13
  let recent = req.path + squareComp + textComp;
  if(RecentPaths.indexOf(recent) >= 0){
    RecentPaths.splice(RecentPaths.indexOf(recent), 1);
  };
  if(RecentPaths.length > 11){
    RecentPaths.pop();
  };

    RecentPaths.unshift(recent);

    app.get('/stats/paths/recent',function(req,response){
      response.status(200).send(RecentPaths);
    });


/////////////////////////////////////////////////////////////////////////////////////////////////////

//CHANGE 14

	let area = { "w":width, "h":height };

	if(RecentSizes.length > 9){
		RecentSizes.pop();
	};

	for(let i = RecentSizes.length;i  >- 1; i--) {
		if (JSON.stringify(RecentSizes[i]) === JSON.stringify(area)) {
			RecentSizes.splice(i, 1);
		};
	};

	RecentSizes.unshift(area)

	app.get('/stats/sizes/recent',function(req,response){
	  response.status(200).send(RecentSizes);
	});

/////////////////////////////////////////////////////////////////////////////////////////////////////

///////CHANGE 15

      if(RecentTexts.length > 9){
        RecentTexts.pop();
      };
      if(RecentTexts.indexOf(text) != -1){
        RecentTexts.splice(RecentTexts.indexOf(text), 1);
      };
      if(text !== '' && typeof text != 'undefined' ){
        RecentTexts.unshift(text);
      };

app.get('/stats/texts/recent',function(req,response){
  response.status(200).send(RecentTexts);
});

///////////////////////////////////////////////////////////////////////////////////////////////////





});
