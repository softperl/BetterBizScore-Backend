const Question = require("../models/questionModel")
const AppError = require('../utils/appError')
const tryCatch = require('../utils/tryCatch')

exports.getAllQuestions = tryCatch(async (req, res, next) => {
   const questions = await Question.find()

   res.status(200).json({
      status: 'success',
      results: questions.length,
      data: {
         questions
      }
   })
})

exports.getQuestion = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const question = await Question.findById(id)

   if (!question) {
      return next(new AppError('No question found with that Id', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         question
      }
   })
})

exports.createQuestion = tryCatch(async (req, res, next) => {
   const newQuestion = await Question.create(req.body)

   res.status(201).json({
      status: 'success',
      data: {
         question: newQuestion
      }
   })
})

exports.updateQuestion = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const question = await Question.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
   })

   if (!question) {
      return next(new AppError('No question found with that Id', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         question
      }
   })
})

exports.deleteQuestion = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const question = await Question.findByIdAndDelete(id)

   if (!question) {
      return next(new AppError('No question found with that Id', 404))
   }

   res.status(204).json({
      status: 'success',
      data: {
         question
      }
   })
})