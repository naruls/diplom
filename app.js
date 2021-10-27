import express from 'express';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import fs from 'fs';
import { MongoClient } from 'mongodb';
import * as mongodb from 'mongodb';
var objTomorrow;
var objOpenWeather;
var objOpenWeatherTemp = {};
var  objTomorrowTemp;

const app = express();

const { PORT = 3000 } = process.env;


const url = "mongodb://localhost:27017/";
const mongoClient = new MongoClient(url);

app.use(express.json());
mongoClient.connect(function(err, client){
const db = client.db("wetherApi");
const tomorrowapi = db.collection("TomorrowApi");
const openweather = db.collection("OpenWeather");
let timerId = setInterval(() => fetchWithInterval(), 60000);
let timerId2 = setInterval(() => fetchWithInterval2(), 60000);
function fetchWithInterval(){
  fetch('https://api.tomorrow.io/v4/timelines?location=60.108884,30.262840&fields=temperature,precipitationIntensity,precipitationType,windSpeed,windGust,windDirection,temperatureApparent&timesteps=1h&units=metric&timezone=Europe/Moscow&apikey=3JBsocTjXabI9MkbPByqznkWNRJ5iZ4D')
        .then(res => res.json())
        .then(json => {
            console.log(json)
            tomorrowapi.insertOne(json)
            let data = JSON.stringify(json);
            fs.writeFile('tomorrowapi.json', data, (err) => {
              if (err) console.log(err);
            });
            objTomorrow = JSON.stringify(json);
        })
}
function fetchWithInterval2(){
  fetch('https://api.openweathermap.org/data/2.5/weather?lat=60.108884&lon=30.262840&lang=fr&appid=c48b10ff7d42501ae1d7246b3fbed3e1')
        .then(res => res.json())
        .then(json => {
            console.log(json)
            openweather.insertOne(json)
            let data = JSON.stringify(json);
            fs.writeFile('openweather.json', data, (err) => {
              if (err) console.log(err);
            });
            objOpenWeather = JSON.stringify(json);
            objOpenWeatherTemp = { temper: json.main.temp, wind: json.wind.speed };
        })
}

});

app.get('/wetherFuter', (request, response) => {
    response.send(objTomorrow);
});

app.get('/wetherToday', (request, response) => {
    response.send(objOpenWeather);
});

app.get('/objOpenWeatherTemp', (request, response) => {
    response.send(objOpenWeatherTemp);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
