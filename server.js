'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');


const PORT = process.env.PORT;
const app = express();
app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

app.get('/', (request, response) => {
  response.send(`It's alllllive!`);
});

app.get('/location', locationCallback);
app.get('/movies', movieHandler);
// app.get('/weather', weatherHandler);
// app.get('/events', eventfulHandler);


//callback functions


function locationCallback (request, response) {
  let city = request.query.city;
  let SQL = `SELECT * FROM locations WHERE searchquery='${city}';`;

  client.query(SQL)
    .then(results => {
      if (results.rows.length > 0){
        response.send(results.rows[0]);
      } else {
        try {
          let key = process.env.GEOCODE_API_KEY;
          let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

          superagent.get(url)
            .then( data => {
              const geoData = data.body[0];
              const location = new Location(city, geoData);
              let {search_query, formatted_query, latitude, longitude} = location;
              let apiToSQL = `INSERT INTO locations (searchquery, formattedquery, latitude, longitude) VALUES ('${search_query}','${formatted_query}', '${latitude}', '${longitude}')`;
              client.query(apiToSQL);
              response.send(location);
            })
            .catch( () => {
              errorHandler('location broke', request, response);
            });
        }
        catch(error){
          errorHandler('Error 500! Something has gone wrong with the website server!', request, response);
        }
      }
    });
}

function movieHandler(request, response) {
  // let movieObject;
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


// function eventfulHandler(request, response) {

//   // console.log(request.query);
//   let url = `http://api.eventful.com/json/events/search?location=${search_query}&app_key=${process.env.EVENTFUL_API_KEY}`;
//   superagent.get(url)
//     .then(data => {
//       let eventfulData = JSON.parse(data.text).events.event;
//       console.log(eventfulData);
//       const eventsArr = eventfulData.map(value => new Event(value));
//       response.send(eventsArr);
//     });
// }

// CONSTRUCTORS
function Location(city, geoData){
  this.searchQuery = city;
  this.formattedQuery = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

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

//helper functions (error catching)
function errorHandler(error, request, response) {
  response.status(500).send(error);
}


//server "listener"
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Server up on port ${PORT}`));
  });
