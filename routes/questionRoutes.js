const express = require('express')

const {
   protect,
   isAdmin
} = require('../controllers/authenticationController')

const {
   getAllQuestions,
   getQuestion,
   createQuestion,
   updateQuestion,
   deleteQuestion
} = require('../controllers/questionController')

const router = express.Router()

router.route('/')
   .get(getAllQuestions)
   .post(protect, isAdmin, createQuestion)

router.route('/:id')
   .get(getQuestion)
   .patch(protect, isAdmin, updateQuestion)
   .delete(protect, isAdmin, deleteQuestion)

module.exports = router;