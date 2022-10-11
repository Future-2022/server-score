const mongoose = require('mongoose');

const HomeSchema = new mongoose.Schema({
  title : {
    type: String,
    unique: true
  },
  category : {
    type: String,
    unique: true
  },
  fase : {
    type: String,
    unique: true
  },
  heat : {
    type: String,
    unique: true
  },
  order : {
    type: Array,
    unique: true
  },
  playerName : {
    type: Array,
    unique: true
  },
  average : {
    type: Array,
    unique: true
  },
  color : {
    type: Array,
    unique: true
  },
  lineColor : {
    type: Array,
    unique: true
  },
  need : {
    type: Array,
    unique: true
  },
  playerResult : {
    type: Array,
    unique: true
  },
  web2Result : {
    type: Array,
    unique: true
  },
});

module.exports = mongoose.model('main', HomeSchema);
