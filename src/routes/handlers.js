'use strict'

const path = require('path')
const guessController = require('../controllers/guesses.controllers')

function hello(req, res) { res.sendFile(path.join(__dirname, '..', 'templates', 'hello.html')) }
function game(req, res) { res.sendFile(path.join(__dirname, '..', 'templates', 'game.html')) }

module.exports = { hello, guessController, game }
