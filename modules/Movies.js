'use strict';

const client = require('./Client.js');
const superagent = require('superagent');

function movieHandler(request, response) {
  const city = request.query.city;
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${city}`;
  try {
    superagent.get(url)
      .then(data => {
        const movieObject = data.body.results.map( obj => new Movie(obj) );
        response.status(200).send(movieObject);
      })
      .catch(console.error());
  } catch(error) {
    errorHandler(error, request, response);
  }
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

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = movieHandler;
