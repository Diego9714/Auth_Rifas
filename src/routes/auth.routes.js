const { LOGIN , STATS } = require('../global/_var.js')

// Dependencies
const express = require('express')
const router = express.Router()

// Controllers
const dataController = require('../controllers/getInfo.controller.js')

// Routes
router.post(LOGIN, dataController.logUser)
router.get(STATS, dataController.stats)

module.exports = router