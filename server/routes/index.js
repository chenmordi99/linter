const express = require('express');
const router = express.Router();

const dataController = require('../controllers/dataController');



router.get('/', function(req, res) {
    res.redirect('/catalog');
  });

module.exports = router;
