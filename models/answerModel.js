const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Every answer should belong to a user']
   },
   industry: {
      type: String,
      required: [true, 'Every answer should be associated with an industry']
   },
   industryId: String,
   totalPoints: Number,
   scoredPoints: Number,
   answers: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Please provide your answers']
   },
   submittedAt: {
      type: Date,
      default: Date.now()
   }
})

const Answer = mongoose.model('Answer', answerSchema)

module.exports = Answer;