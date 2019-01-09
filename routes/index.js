var express = require('express');
var router = express.Router();
var request = require('request');
var mongoose = require('mongoose');

// config mongodb  MLAB
// A PERSONNALISER EN FONCTION DE VOTRE SERVEUR
var mlabServer = "";
var options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true
};

mongoose.connect('mongodb://' + mlabServer, options, function(err) {
  console.log(err);
});

var citySchema = mongoose.Schema({
  name: String,
  tempMin: Number,
  tempMax: Number,
  status: String,
  img: String,
  lon: Number,
  lat: Number
});
var CityModel = mongoose.model('cities', citySchema);

// route racine de la famille index
router.get('/', function(req, res, next) {
  CityModel.find(function(err, cities) {
    res.render('index', {cityList: cities});
  });
});

var APIkey = "8f5991ebd51d588495e3535d590f3254";

// route d'ajout d'une ville
router.post('/add-city', function(req, res, next) {
  request('http://api.openweathermap.org/data/2.5/weather?q=' + req.body.city + '&APPID=' + APIkey + '&units=metric&lang=fr', function(error, response, body) {
    body = JSON.parse(body);
    console.log(body.coord.lat);
    console.log(body.coord.lon);
    // condition qui vérifie si l'api renvoit une requete favorable & si input n'est pas vide
    if (body.cod != 404 && req.body.city != "") {
      var isCityFound = false;

      // vérification si doublon de ville
      CityModel.find(function(err, cities) {
        for (var i = 0; i < cities.length; i++) {
          if (req.body.city.toLowerCase() === cities[i].name.toLowerCase()) {
            isCityFound = true;
          }
        }
        // utilisation du flag et ajout d'une ville dans la BDD
        if (!isCityFound) {
          var newCity = new CityModel({
            name: req.body.city,
            tempMin: body.main.temp_min,
            tempMax: body.main.temp_max,
            status: body.weather[0].description,
            img: 'http://openweathermap.org/img/w/' + body.weather[0].icon + '.png',
            lon: body.coord.lon,
            lat: body.coord.lat
          });

          //sauvegarde et recherche de toutes les villes pour affichage dans l'index
          newCity.save(function(error, city) {
            CityModel.find(function(error, cities) {
              res.render('index', {cityList: cities});
            });
          });
        }
      });
    }
  });
});

// route de suppression de ville
router.post('/delete-city', function(req, res, next) {
  CityModel.deleteOne({
    _id: req.body.id
  }, function(error) {
    CityModel.find(function(error, cities) {
      res.render('index', {cityList: cities});
    });
  });
});

module.exports = router;
