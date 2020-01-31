'use strict';

require('dotenv').config();

// ======================== PACKAGES =========================
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const PORT = process.env.PORT;
const app = express();
app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));


// ======================== ROUTES ============================

app.get('/', (request, response) => {
  response.send(`It's alllllive!`);
});

const location = require('./modules/Location.js');

app.get('/location', locationCallback);
app.get('/movies', movieHandler);
app.get('/yelp', yelpHandler);
// app.get('/weather', weatherHandler);
// app.get('/events', eventfulHandler);


// ======================== CALLBACK FUNCTIONS =========================
function locationCallback (request, response) {
  let city = request.query.city;

  location.getLocationData(city)
    .then( data => sendJson(data, response))
    .catch((error) => errorHandler(error, request, response));
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


function eventfulHandler(request, response) {
  let url = `http://api.eventful.com/json/events/search?location=${search_query}&app_key=${process.env.EVENTFUL_API_KEY}`;
  superagent.get(url)
    .then(data => {
      let eventfulData = JSON.parse(data.text).events.event;
      console.log(eventfulData);
      const eventsArr = eventfulData.map(value => new Event(value));
      response.send(eventsArr);
    });
}

// ======================= CONSTRUCTORS ======================

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toDateString();
}

function Event(object) {
  this.link = object.url;
  this.name = object.title;
  this.event_date = object.start_time;
  this.summary = object.description;
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

function sendJson(data, response){
  response.status(200).send(data);
}


// ====================== SERVER "LISTENER" ========================
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Server up on port ${PORT}`));
  });
