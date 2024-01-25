const express = require('express')

const {
   protect
} = require('../controllers/authenticationController')

const {
   getAnswer,
   postAnswer
} = require('../controllers/answerController')

const router = express.Router()

router.use(protect)

router.route('/').post(postAnswer)

router.route('/:userId').get(getAnswer)

module.exports = router;