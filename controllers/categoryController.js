const Category = require("../models/categoryModel")
const AppError = require('../utils/appError')
const tryCatch = require('../utils/tryCatch')

exports.getAllCategories = tryCatch(async (req, res, next) => {
   const categories = await Category.find()

   res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
         categories
      }
   })
})

exports.getCategoriesByIds = tryCatch(async (req, res, next) => {
   const { ids } = req.body; 

   // Convert the array of string IDs to Mongoose ObjectIds
   const objectIds = ids.map(id => mongoose.Types.ObjectId(id));

   const categories = await Category.find({ _id: { $in: objectIds } });

   res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
         categories
      }
   });
});




exports.getCategory = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const category = await Category.findById(id).populate('questions')

   if (!category) {
      return next(new AppError('No category found with that Id', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         category
      }
   })
})

exports.createCategory = tryCatch(async (req, res, next) => {
   const newCategory = await Category.create(req.body)

   res.status(201).json({
      status: 'success',
      data: {
         category: newCategory
      }
   })
})

exports.updateCategory = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
   })

   if (!category) {
      return next(new AppError('No category found with that Id', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         category
      }
   })
})

exports.deleteCategory = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const category = await Category.findByIdAndDelete(id)

   if (!category) {
      return next(new AppError('No category found with that Id', 404))
   }

   res.status(204).json({
      status: 'success',
      data: {
         category
      }
   })
})