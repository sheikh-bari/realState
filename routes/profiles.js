var express = require('express');
var router = express.Router();

/* GET users listing. */

router.get('/', function(req, res, next) {
  res.render('index');
});


router.get('/omer', function(req, res, next) {
  res.render('omer');
});

router.get('/saud', function(req, res, next) {
  res.render('saud');
});

router.get('/abdulbari', function(req, res, next) {
  res.render('abdulbari');
});

router.get('/praveen', function(req, res, next) {
  res.render('praveen');
});


module.exports = router;
