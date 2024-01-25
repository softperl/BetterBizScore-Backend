const express = require('express')

const {
   getAllPackages,
   getPackage,
   createPackage,
   updatePackage,
   deletePackage
} = require('../controllers/packageController')

const {
   protect,
   isAdmin
} = require('../controllers/authenticationController')

const router = express.Router()

router.route('/')
   .get(getAllPackages)
   .post(protect, isAdmin, createPackage)

router.route('/:id')
   .get(getPackage)
   .patch(protect, isAdmin, updatePackage)
   .delete(protect, isAdmin, deletePackage)


module.exports = router;