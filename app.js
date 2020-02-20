require('dotenv').config();
const express = require('express');
const app = express ();
const request = require('superagent');
//entonces borras const data porque ya no lo estas usando
// const data = require('./geo.js');
// same with weather
// const weather = require('./data/darksky.js');
const cors = require('cors');


app.use(cors());

let lat;
let lng;

app.get('/location', async(req, res, next) => {
    try {
    //location sera portland 
        const location = req.query.search;
        const URL = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json`;
//evetrytime we to hit up another api with superagent we want to put request.get()
        const cityData = await request.get(URL);
        console.log(cityData);
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
        res.json({
            formatted_query: firstResult.display_name,
            latitude: lat,
            longitude: lng,
        });
        //
    } catch (error) {
        next (error);
    }
});

const getWeatherData = async(lat, lng) => {
    console.log(lat, lng);
    console.log(process.env.WEATHER_API_KEY)
    const weather = await request.get(`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lat},${lng}`);
    return weather.body.daily.data.map(forecast => {
        return {
            forecast:forecast.summary,
            time:new Date(forecast.time * 1000),
        };
    });
};

app.get('/weather', async(req, res, next) => {
    try {
        const portlandWeather = await getWeatherData(lat, lng);
    
        res.json(portlandWeather);
    } catch (error){
        next(error);
    }
});


module.exports = {
    app: app,
};
//SO AQUI ESTAS DICIENDO: usa el port que puse en .env or el que sea que tenga disponible (keep port in the 3000+)
//si ambos estan ocupados, cambia primero el de env. no el de aqui
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('listening on port', port);
});