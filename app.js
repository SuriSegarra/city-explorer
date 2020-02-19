require('dotenv').config();
const express = require('express');
const app = express ();
const request = require('superagent');
//entonces borras const data porque ya no lo estas usando
// const data = require('./geo.js');
const weather = require('./data/darksky.js');
const cors = require('cors');


app.use(cors());

let lat;
let lng;

app.get('/location', async(request, respond, next) => {
    try {
    //location sera portland 
        const location = request.query.search;
        const URL = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json`;

        const cityData = await request.get(URL);
// makig sure that the get route was working. as i have api, le cambio el valor 
//antes 
    // const cityData = data.results[0];
//despues
//.body me da todo el data. le puse [0] para ue ,e diera solo el primer item
        const firstResult = cityData.body[0];
//luego cambias el valor de estas variables 
//antes 
// lat = cityData.geometry.location.lat;
// lng = cityData.geometry.location.lng;
//despues 
        lat = firstResult.lat;
        lng = firstResult.lon;
//antes 
    // respond.json({
    //     formatted_query: cityData.formatted_address,
    //     latitude:cityData.geometry.location.lat,
    //     longitude:cityData.geometry.location.lng,
//despues 
        respond.json({
            formatted_query: firstResult.display_name,
            latitude: lat,
            longitude: lng,
        });
    } catch (error) {
        next (error);
    }
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
//SO AQUI ESTAS DICIENDO: usa el port que puse en .env or el que sea que tenga disponible (keep port in the 3000+)
//si ambos estan ocupados, cambia primero el de env. no el de aqui
const port = process.env.PORT || 5002;

app.listen(port, () => {
    console.log('listening on port', port);
});