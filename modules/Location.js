'use strict';

const client = require('./Client.js');
const superagent = require('superagent');

function locationCallback (request, response) {
  let city = request.query.city;
  let SQL = `SELECT * FROM locations WHERE searchquery='${city}';`;

  client.query(SQL)
    .then(results => {
      if (results.rowCount){
        response.status(200).json(results.rows[0]);
      } else {
        let key = process.env.GEOCODE_API_KEY;
        let url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;

        return superagent.get(url)
          .then( data => {
            const geoData = data.body[0];
            const location = new Location(city, geoData);
            let {search_query, formatted_query, latitude, longitude} = location;
            let apiToSQL = `INSERT INTO locations (searchquery, formattedquery, latitude, longitude) VALUES ('${search_query}','${formatted_query}', '${latitude}', '${longitude}')`;
            return client.query(apiToSQL)
              .then( () => {
                response.status(200).json(location);
              })
              .catch(console.error());
          });
      }
    })
    .catch(console.error());
}

function Location(city, geoData){
  this.searchQuery = city;
  this.formattedQuery = geoData.display_name;
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}

module.exports = locationCallback;
