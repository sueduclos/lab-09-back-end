'use strict';

// ======================== PACKAGES =========================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT;
const app = express();
app.use(cors());

// ======================== MODULES ==========================

const client = require('./modules/Client.js');
const locationCallback = require('./modules/Location.js');


// ======================== ROUTES ============================

app.get('/', (request, response) => {
  response.send(`Welcome Home!`);
});

app.get('/location', locationCallback);
// app.get('/weather', weatherHandler);
// app.get('/movies', movieHandler);
// app.get('/yelp', yelpHandler);


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

function movieHandler(request, response) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=seattle`;
  try {
    superagent.get(url)
      .then(data => {
        const movieObject = data.body.results.map( obj => new Movie(obj) );
        response.send(movieObject);
      });
  } catch(error) {
    errorHandler(error, request, response);
  }
}

function yelpHandler(request, response) {
  const url = `https://api.yelp.com/v3/businesses/search?location=Seattle`;
  try {
    superagent.get(url)
      .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
      .then(data => {
        const yelpObject = data.body.businesses.map( obj => new Business(obj) );
        response.send(yelpObject);
      });
  } catch(error) {
    errorHandler(error, request, response);
  }
}

// ======================= CONSTRUCTORS ======================

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toDateString();
}

function Movie (movieData){
  this.title = movieData.original_title;
  this.overview = movieData.overview;
  this.average_votes = movieData.vote_average;
  this.total_votes = movieData.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${movieData.poster_path}`;
  this.popularity = movieData.popularity;
  this.released_on = movieData.release_date;
}

function Business (yelpData){
  this.name = yelpData.name;
  this.image_url = yelpData.image_url;
  this.price = yelpData.price;
  this.rating = yelpData.rating;
  this.url = yelpData.url;
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
