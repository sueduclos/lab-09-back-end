'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const PORT = process.env.PORT;
const app = express();
app.use(cors());

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));


const location = {};

location.getLocationData = function(city) {
  let SQL = `SELECT * FROM locations WHERE searchquery='${city}';`;

  return client.query(SQL)
    .then( results => {
      if (results.rowCount){
        return results.rows[0];
      } else {
        let key = process.env.GEOCODE_API_KEY;
        let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

        return superagent.get(url)
          .then( data => storeLocation(city, data.body));
      }
    });
};

function storeLocation(city, data){
  const location = new Location(city, data[0]);

  let apiToSQL = `INSERT INTO locations (searchquery, formattedquery, latitude, longitude) VALUES ('${search_query}','${formatted_query}', '${latitude}', '${longitude}') RETURNING *;`;

  let {search_query, formatted_query, latitude, longitude} = location;
  return client.query(apiToSQL, location)
    .then( results => results.rows[0]);
}

function Location(city, geoData){
  this.searchQuery = city;
  this.formattedQuery = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

module.exports = location;

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Server up on port ${PORT}`));
  });
