const Package = require("../models/packageModel")
const AppError = require('../utils/appError')
const tryCatch = require('../utils/tryCatch')

exports.getAllPackages = tryCatch(async (req, res, next) => {
   const packages = await Package.find()

   res.status(200).json({
      status: 'success',
      results: packages.length,
      data: {
         packages
      }
   })
})

exports.getPackage = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const package = await Package.findById(id)

   if (!package) {
      return next(new AppError('No package found with that Id', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         package
      }
   })
})

exports.createPackage = tryCatch(async (req, res, next) => {
   const newPackage = await Package.create(req.body)

   res.status(201).json({
      status: 'success',
      data: {
         package: newPackage
      }
   })
})

exports.updatePackage = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const package = await Package.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
   })

   if (!package) {
      return next(new AppError('No package found with that Id', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         package
      }
   })
})

exports.deletePackage = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const package = await Package.findByIdAndDelete(id)

   if (!package) {
      return next(new AppError('No package found with that Id', 404))
   }

   res.status(204).json({
      status: 'success',
      data: {
         package
      }
   })
})