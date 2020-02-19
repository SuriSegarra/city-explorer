const express = require('express');
const app = express ();
const request = require('superagent');
const data = require('./geo.js');

app.get('/location', (request, respond) => {
    const cityData = data.results[0];


    respond.json({
        formatted_query:
    cityData.formatted_address,
        latitude:cityData.geometry.location.lat,
        longitude:cityData.geometry.location.lng,
    });
});


const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('listening on port', port);
});