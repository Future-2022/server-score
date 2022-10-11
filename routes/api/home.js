const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');
const Home = require('../../models/Home');

// @route    POST api/users/signUp
// @desc     Register user
// @access   Public
router.get(
  '/',
  async (req, res) => {
    try {      
      const data = await Home.find();
      res.json({msg: data});
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);


module.exports = router;
