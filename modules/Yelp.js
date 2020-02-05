'use strict';

const client = require('./Client.js');
const superagent = require('superagent');

function yelpHandler(request, response) {
  const city = request.query.city;
  const url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
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

function Business (yelpData){
  this.name = yelpData.name;
  this.image_url = yelpData.image_url;
  this.price = yelpData.price;
  this.rating = yelpData.rating;
  this.url = yelpData.url;
}

function errorHandler(error, request, response) {
  response.status(500).send(error);
}

module.exports = yelpHandler;
