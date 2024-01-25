const Profile = require("../models/profileModel")
const AppError = require('../utils/appError')
const tryCatch = require('../utils/tryCatch')

exports.getAllProfiles = tryCatch(async (req, res, next) => {
   const profiles = await Profile.find()

   res.status(200).json({
      status: 'success',
      results: profiles.length,
      data: {
         profiles
      }
   })
})

exports.getProfile = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const profile = await Profile.findOne({ userId: id })

   res.status(200).json({
      status: 'success',
      data: {
         profile
      }
   })
})

exports.createProfile = tryCatch(async (req, res, next) => {
   const newProfile = await Profile.create({
      userId: req.user._id,
      ...req.body
   })

   res.status(201).json({
      status: 'success',
      data: {
         profile: newProfile
      }
   })
})

exports.updateProfile = tryCatch(async (req, res, next) => {
   const { id } = req.params;
   const profile = await Profile.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
   })

   if (!profile) {
      return next(new AppError('No profile found with that Id', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         profile
      }
   })
})

exports.deleteProfile = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const profile = await Profile.findByIdAndDelete(id)

   if (!profile) {
      return next(new AppError('No profile found with that Id', 404))
   }

   res.status(204).json({
      status: 'success',
      data: {
         profile
      }
   })
})

// ** This Function Was Called From `userRoutes`
exports.getProfileByUserId = tryCatch(async (req, res, next) => {
   const userId = req.user.id
   const profile = await Profile.findOne({ userId })

   if (!profile) {
      return next(new AppError('No profile found for this user', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         profile
      }
   })
})