'use strict';

const client = require('./Client.js');
const superagent = require('superagent');

function weatherHandler(request, response) {
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;
  try {
    superagent.get(url)
      .then(data => {
        const weatherSummaries = data.body.daily.data.map(day => {
          return new Weather(day);
        });
        response.send(weatherSummaries);
      })
      .catch((error) => {
        errorHandler(error, request, response);
      });
  } catch(error) {
    errorHandler(error, request, response);
  }
}

function Weather(day){
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = weatherHandler;
