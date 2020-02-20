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
//initializing global state of lat and lng so it accesible to routes
let lat;
let lng;

app.get('/location', async(req, res, next) => {
    try {
    //location sera portland 
    //www.the-api.com?search=portland
        const location = req.query.search;
        //to hide key
        const URL = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${location}&format=json`;
//evetrytime we to hit up another api with superagent we want to put request.get()
        const cityData = await request.get(URL);
        
// makig sure that the get route was working. as i have api, le cambio el valor 
//antes 
    // const cityData = data.results[0];
    //.body me da todo el data. le puse [0] para ue ,e diera solo el primer item
 //despues
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
//without running location weather is not gonna work. 
//
const getWeatherData = async(lat, lng) => {
   
    const weather = await request.get(`https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${lat},${lng}`);
    
    return weather.body.daily.data.map(forecast => {
        return {
            forecast: forecast.summary,
            time: new Date(forecast.time * 1000),
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

const getEventData = async(lat, lng) => {
    const event = await request.get(`http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&where=${lat},${lng}`);

//calling the data I put and turned it into json. so the function can read it 
    const parsedEventData = JSON.parse(event.text);
   
    return parsedEventData.events.event.map(parties => {
        return {
            link: parties.url,
            name: parties.title,
            time: parties.start_time,
            summary: parties.event_url

        };
    });

};
app.get('/event', async(req, res, next) => {
    try {
        const portlandEvents = await getEventData(lat, lng);

        res.json(portlandEvents);
    } catch (error){
        next(error);
    }
});

app.get('/yelp', async(req, res, next) => {
    try {
        const yelpStuff = await request
            .get(`https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${lat}&longitude=${lng}`)
            .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`);
        const parsedYelp = JSON.parse(yelpStuff.text);
        console.log(parsedYelp);
        const yelp = parsedYelp.businesses.map(restaurants => {
            return {
                name: restaurants.name,
                image: restaurants.image_url,
                price: restaurants.price,
                rating: restaurants.rating,
                url: restaurants.url
            };
        });
        res.json(yelp);

    } catch (error){
        next(error);
    }
});


//SO AQUI ESTAS DICIENDO: usa el port que puse en .env or el que sea que tenga disponible (keep port in the 3000+)
//si ambos estan ocupados, cambia primero el de env. no el de aqui
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('listening on port', port);
});

module.exports = {
    app: app,
};