const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
   option: {
      type: String,
      required: true,
   },
   points: {
      type: Number,
      required: true,
   },
}, {
   _id: false
})

const questionSchema = new mongoose.Schema({
   question: {
      type: String,
      required: [true, 'Please provide the question title'],
   },
   description: String,
   categoryId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a category for this question']
   },
   options: [
      optionSchema
   ]
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
