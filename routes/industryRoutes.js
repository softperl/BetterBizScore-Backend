const express = require('express')

const {
   protect,
   isAdmin
} = require('../controllers/authenticationController')

const {
   getAllIndustries,
   getIndustry,
   createIndustry,
   updateIndustry,
   deleteIndustry
} = require('../controllers/industryController')

const router = express.Router()

router.route('/')
   .get(getAllIndustries)
   .post(protect, isAdmin, createIndustry)

router.route('/:id')
   .get(getIndustry)
   .patch(protect, isAdmin, updateIndustry)
   .delete(protect, isAdmin, deleteIndustry)

module.exports = router;