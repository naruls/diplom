import express from 'express';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import cors from 'cors';
import _ from 'lodash'; /*необходимая для merge библиотека*/
import fs from 'fs';
import { MongoClient } from 'mongodb';
import * as mongodb from 'mongodb';


var objDataTo = {};
var objEndOp = {};
var objEndData = {};

const app = express();

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
    methods: "GET",
}

app.use(cors(corsOptions));

const { PORT = 3000 } = process.env;

const osinovaiRosFirsPointTomorrow = "https://api.tomorrow.io/v4/timelines?location=60.108884,30.262840&fields=temperature,precipitationIntensity,precipitationType,windSpeed,windGust,windDirection,temperatureApparent&timesteps=1h&units=metric&timezone=Europe/Moscow&apikey=3JBsocTjXabI9MkbPByqznkWNRJ5iZ4D";
const osinovaiRosFirsPointOpenweter = "https://api.openweathermap.org/data/2.5/weather?lat=60.108884&lon=30.262840&lang=fr&appid=c48b10ff7d42501ae1d7246b3fbed3e1"
const url = "mongodb://localhost:27017/";
const mongoClient = new MongoClient(url);

app.use(express.json());

function fetchDataTomorrow(link, route){
  fetch(link)
    .then(res => res.json())
    .then(json => {
      objDataTo = { data: json.data.timelines[0].intervals[0].values};
      console.log(objDataTo);
      route.insertOne(json);
    })
    .catch(err =>{
      console.log(err);
   })
}

function fetchDataOpenweathermap(link, route){
  fetch(link)
    .then(res => res.json())
    .then(json => {
      objEndOp = { temper: json.main.temp, wind: json.wind.speed };
        console.log(json);
        route.insertOne(json);
      })
      .catch(err =>{
        console.log(err);
      })

}

function pointFetchForecast(linkTomorrow, routeTomorrow, linkOpenwether, routeOpenwether, endDataRoute){
  fetchDataTomorrow(linkTomorrow, routeTomorrow)
  fetchDataOpenweathermap(linkOpenwether, routeOpenwether);
  var objResult = _.merge(objEndOp, objDataTo);
  objEndData = objResult;
  console.log(objEndData)
  endDataRoute.insertOne(objEndData);
}


mongoClient.connect(function(err, client){
  const db = client.db("wetherApi");
  const tomorrowapi = db.collection("TomorrowApi");
  const openweather = db.collection("OpenWeather");
  const endData = db.collection("endData");

  let timerId = setInterval(() => pointFetchForecast(osinovaiRosFirsPointTomorrow, tomorrowapi, osinovaiRosFirsPointOpenweter, openweather, endData), 30000);

});


app.get('/objEndData', (request, response) => {
    response.send(objEndData);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
