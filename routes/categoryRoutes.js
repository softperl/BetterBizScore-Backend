const express = require('express')

const {
   protect,
   isAdmin
} = require('../controllers/authenticationController')

const {
   getAllCategories,
   getCategory,
   createCategory,
   updateCategory,
   deleteCategory,

} = require('../controllers/categoryController')

const router = express.Router()

router.route('/')
   .get(getAllCategories)
   .post(protect, isAdmin, createCategory)

router.route('/:id')
   .get(getCategory)
   .patch(protect, isAdmin, updateCategory)
   .delete(protect, isAdmin, deleteCategory)

module.exports = router;