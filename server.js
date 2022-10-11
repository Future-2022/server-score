const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
var bodyParser = require('body-parser');
var app = require('express')();
const cors = require('cors');
const fs = require('fs');
const {GoogleSpreadsheet} = require('google-spreadsheet');
var http = require('http').createServer(app);
const {SPREADSHEET_ID, CLIENT_EMAIL, PRIVATE_KEY} = require('./service/service');
const Home = require('./models/Home');

app.use(cors({
    origin: '*'
}));

connectDB();

const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
let count = 0;
// Init Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Define Routes
let sheet = [];
app.use('/api/home', require('./routes/api/home'));
const loadSheet = async () => {
  await doc.useServiceAccountAuth({
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY,
  });
}
loadSheet();
const getHomeData = () => {
  const interval = setInterval(() => {
    getData();
  }, 4000);
  const getData = async () => {    
    console.log("D: " + count);
    // loads document properties and worksheets
    await doc.loadInfo();
    sheet = doc.sheetsByIndex[0];
    await sheet.loadCells('A1:S25');
    let conOrder = [];
    let conPlayerResult = [];
    const playerName = [];
    let conAverage = [];
    let conColor = [];
    let conLineColor = [];
    let conNeed = [];
    let conWeb2Result = [];
    // loads range of cells into local cache - DOES NOT RETURN THE CELLS

    for(var i = 0; i < 4; i++) {
      conWeb2Result[i] = [];
      for(var j = 0; j < 4; j++) {
          const playerType = await sheet.getCell(4 + i, 8 + j).valueType
          if(playerType == 'errorValue') {
            conWeb2Result[i][j] = 0;
          } else {
            conWeb2Result[i][j] = await sheet.getCell(4 + i, 8 + j).value;
          }
      }
    }

    for(var i = 0; i < 4; i++){
      const playerType = await sheet.getCell(4 + i, 2).valueType
      if(playerType == 'errorValue') {
          playerName[i] = "#N/A";
      } else {                    
          playerName[i] = await sheet.getCell(4 + i, 2).value;
      }
    }

    const conTitle = await sheet.getCell(2, 14).value;
    const conCategory = await sheet.getCell(3, 16).value;
    const conFase = await sheet.getCell(4, 15).value;
    const conHeat = await sheet.getCell(5, 15).value;

    for(var i = 0; i < 4; i++) {
      const colorType = await sheet.getCell(4 + i, 1).value;
      if(colorType == 'Vermelho') {
          conColor[i] = 'red-player'
      } else if(colorType == 'Branco') {
          conColor[i] = 'white-player'
      } else if(colorType == 'Amarelo') {
          conColor[i] = 'yellow-player'
      } else if(colorType == 'Preto') {
          conColor[i] = 'black-player'
      } else if(colorType == 'Verde') {
          conColor[i] = 'green-player'
      }
    }

    for(var i = 0; i < 4; i++){
        const orderData = await sheet.getCell(19 + i, 10).valueType
        if(orderData == 'errorValue') {
            conOrder[i] = "#N/A";
        } else {                    
            conOrder[i] = await sheet.getCell(19 + i, 10).value;
        }
    } 

    for(var i =0; i < 4; i++) {
        if(conOrder[i] == 'Vermelho') {
            conLineColor[i] = 'red-line';
        } else if(conOrder[i] == 'Branco') {
            conLineColor[i] = 'white-line';
        } else if(conOrder[i] == 'Amarelo') {
            conLineColor[i] = 'yellow-line';
        } else if(conOrder[i] == 'Preto') {
            conLineColor[i] = 'black-line';
        } else if(conOrder[i] == 'Verde') {
            conLineColor[i] = 'green-line';
        }
    }

    for(var i = 0; i < 4; i++){
        const playerType = await sheet.getCell(4 + i, 10).valueType
        if(playerType == 'errorValue') {
            conAverage[i] = "#N/A";
        } else {                    
            conAverage[i] = await sheet.getCell(4 + i, 10).value;
        }
    }
    for(var i = 0; i < 3; i++){
        const playerType = await sheet.getCell(5 + i, 11).valueType
        if(playerType == 'errorValue') {
            conNeed[i] = "";
        } else {                    
            conNeed[i] = await sheet.getCell(5 + i, 11).value;
        }
    }

    for(var i = 0; i < 4; i++) {
        conPlayerResult[i] = [];
        for(var j = 0; j < 15; j++) {
            const playerType = await sheet.getCell(10 + i, 2 + j).valueType
            if(playerType == 'errorValue') {
                conPlayerResult[i][j] = ' ';
            } else {
                conPlayerResult[i][j] = await sheet.getCell(10 + i, 2 + j).value;
            }
        }
    }
    let homeData = await Home.find();
    if(homeData.length == 0) {
      console.log('0000');
      console.log(conTitle);
      homeValue = new Home({
        title: conTitle,
        category: conCategory,
        fase: conFase,
        heat: conHeat,
        order: conOrder,
        playerName: playerName,
        average: conAverage,
        color: conColor,
        lineColor: conLineColor,
        need: conNeed,
        playerResult: conPlayerResult,
        web2Result: conWeb2Result
      })
      await homeValue.save();
    } else {
      await Home.updateOne({_id: homeData[0]._id},{$set:{'title':conTitle, 'category': conCategory, 'fase': conFase, 
                            'heat': conHeat, 'order': conOrder, 'playerName': playerName, 'average': conAverage,
                            'color': conColor, 'lineColor': conLineColor, 'need': conNeed, 'playerResult':conPlayerResult, 'web2Result': conWeb2Result}});
    }
    count++;
  }
  return () => clearInterval(interval);
}
getHomeData()


// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

http.listen(5000, ()=> {
     console.log('listening on *:5000s');
});