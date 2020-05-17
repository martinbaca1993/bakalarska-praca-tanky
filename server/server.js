const path = require('path');
const jsdom = require('jsdom');
const fs = require('fs');

var PORT = process.env.PORT || 5000;
var express = require('express');
var app = express();
var server = require('http').Server(app);

const Datauri = require('datauri');
const datauri = new Datauri();

const { JSDOM } = jsdom;
var io = require('socket.io').listen(server);

app.use(express.static('client'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//SPUSTÍ PHASER SERVER HRU
function setupAuthoritativePhaser() {
  JSDOM.fromFile(path.join(__dirname, '/index.html'), {
    //NA SPUSTENIE SKRIPTOV V HTML SÚBORE
    runScripts: "dangerously",
    //NAČÍTANIE EXTERNÝCH ZDROJOV
    resources: "usable",
    pretendToBeVisual: true
  }).then((dom) => {
    dom.window.URL.createObjectURL = (blob) => {
      if (blob){
        return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
      }
    };
    dom.window.URL.revokeObjectURL = (objectURL) => {};
    
    dom.window.gameLoaded = () => {
      server.listen(PORT, function () {
        console.log(`Listening on ${server.address().port}`);
      });
    };
    dom.window.io = io;
    dom.window.fs = fs;
  }).catch((error) => {
    console.log(error.message);
  });
}

setupAuthoritativePhaser();

