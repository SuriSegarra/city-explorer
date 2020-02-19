const express = require('express');
const app = express ();
const request = require('superagent');
const data = require('./geo.js');
const weather = require('./data/darksky.js');
const cors = require('cors');

app.use(cors());

let lat;
let lng;

app.get('/location', (request, respond) => {
    const location = request.query.search;

    const cityData = data.results[0];

lat = cityData.geometry.location.lat;
lng = cityData.geometry.location.lng;

    respond.json({
        formatted_query: cityData.formatted_address,
        latitude:cityData.geometry.location.lat,
        longitude:cityData.geometry.location.lng,
    });
});

const getWeatherData = (lat, lng) => {
    return weather.daily.data.map(forecast => {
        return {
            forecast:forecast.summary,
            time:new Date(forecast.time * 1000),
        };
    });
};

app.get('/weather', (request, respond) => {
    const portlandWeather = getWeatherData(lat, lng);
    
    respond.json(portlandWeather);
});

module.exports = {
    app: app,
};

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('listening on port', port);
});