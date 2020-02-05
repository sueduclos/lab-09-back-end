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
const weatherHandler = require('./modules/Weather.js');
const movieHandler = require('./modules/Movies.js');
const yelpHandler = require('./modules/Yelp.js');


// ======================== ROUTES ============================

app.get('/', (request, response) => {
  response.send(`Welcome Home!`);
});

app.get('/location', locationCallback);
app.get('/weather', weatherHandler);
app.get('/movies', movieHandler);
app.get('/yelp', yelpHandler);


// ====================== HELPER FUNCTIONS =======================
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

// ====================== SERVER "LISTENER" ========================
function startServer() {
  app.listen(process.env.PORT, () => console.log(`Server up on port ${process.env.PORT}`));
}

startServer();
