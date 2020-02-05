'use strict';

// ======================== PACKAGES =========================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const app = express();
app.use(cors());

// ======================== MODULES ==========================

const client = require('./modules/Client.js');
const locationCallback = require('./modules/Location.js');
const movieHandler = require('./modules/Movies');
const yelpHandler = require('./modules/Yelp');


// ======================== ROUTES ============================

app.get('/', (request, response) => {
  response.send(`Welcome Home!`);
});

app.get('/location', locationCallback);
// app.get('/weather', weatherHandler);
app.get('/movies', movieHandler);
app.get('/yelp', yelpHandler);


// ======================== CALLBACK FUNCTIONS =========================

function weatherHandler(request, response) {
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${latitude},${longitude}`;
  superagent.get(url)
    .then(data => {
      const weatherSummaries = data.body.daily.data.map(day => {
        return new Weather(day);
      });
      response.send(weatherSummaries);
    })
    .catch(() => {
      errorHandler('not today satan.', request, response);
    });
}

// ======================= CONSTRUCTORS ======================

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toDateString();
}

// ====================== HELPER FUNCTIONS =======================
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

// ====================== SERVER "LISTENER" ========================
function startServer() {
  app.listen(process.env.PORT, () => console.log(`Server up on port ${process.env.PORT}`));
}

startServer();
