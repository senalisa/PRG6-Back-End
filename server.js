const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');

require('dotenv').config();

// Import the mongoose module
const mongoose = require("mongoose");

// Set up default mongoose connection
const mongoDB = "mongodb://127.0.0.1/memories";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));


//create webserver
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({type:'application/json'}))

const memoriesRoute = require("./routes/memories.js");

app.use('/', memoriesRoute)
app.use(cors);

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
    if ('OPTIONS' === req.method)
      res.sendStatus(200);
    else
      next();
  });

//start webserver on port 8000
app.listen(8000, () => {
    console.log("Webserver Started!")
})

