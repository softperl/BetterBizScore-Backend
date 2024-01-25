const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
   from: {
      type: Number,
      required: [true, 'Please provide information'],
   },
   to: {
      type: Number,
      required: [true, 'Please provide information'],
   },
   suggestion:
   {
      type: String,
      required: [true, 'Please provide information'],
   },
});


const categorySchema = new mongoose.Schema({
   name: {
      type: String,
      unique: [true, 'Category already exists'],
      required: [true, 'Please provide category name'],
   },

   suggestions: [suggestionSchema]
}, {
   id: false,
   __v: false,
   toJSON: { virtuals: true },
   toObject: { virtuals: true }
},
);

categorySchema.virtual('questions', {
   ref: 'Question',
   foreignField: 'categoryId',
   localField: '_id'
})

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
