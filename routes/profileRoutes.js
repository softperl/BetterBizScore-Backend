const express = require('express')

const {
   getAllProfiles,
   getProfile,
   createProfile,
   updateProfile,
   deleteProfile
} = require('../controllers/profileController')

const {
   protect,
   isAdmin
} = require('../controllers/authenticationController')

const router = express.Router()

router.use(protect)

router.route('/')
   .get(isAdmin, getAllProfiles)
   .post(createProfile)

router.route('/:id')
   .get(getProfile)
   .patch(updateProfile)
   .delete(isAdmin, deleteProfile)


module.exports = router;