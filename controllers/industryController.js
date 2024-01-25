const Industry = require("../models/industryModel");
const User = require("../models/userModel");
const AppError = require('../utils/appError')
const tryCatch = require('../utils/tryCatch')

exports.getAllIndustries = tryCatch(async (req, res, next) => {
   const { userId } = req.query;
   const alreadyAnswered = await User.findOne({ _id: userId }, { industryId: 1 });
   const query = {};
   if(alreadyAnswered && alreadyAnswered?.industryId){
      query._id = alreadyAnswered.industryId;
   }
   const industries = await Industry.find(query).select("-categories")

   res.status(200).json({
      status: 'success',
      results: industries.length,
      data: {
         industries
      }
   })
})

exports.createIndustry = tryCatch(async (req, res, next) => {
   const newIndustry = await Industry.create(req.body)

   res.status(201).json({
      status: 'success',
      data: {
         industry: newIndustry
      }
   })
})

/* exports.getAllIndustries = tryCatch(async (req, res, next) => {
   const [{ industries }] = await Industry.find({})

   res.status(200).json({
      status: 'success',
      results: industries.length,
      data: {
         industries
      }
   })
}) */

exports.getIndustry = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const industry = await Industry.findById(id).populate('categories')

   if (!industry) {
      return next(new AppError('No industry found with that Id', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         industry
      }
   })
})

/* exports.createIndustry = tryCatch(async (req, res, next) => {
   const { industry } = req.body;
   const [industries] = await Industry.find({})

   if (!industries) {
      const newIndustry = new Industry({ industries: [] });
      await newIndustry.save();
   }

   await industries.addIndustry(industry);

   const { industries: industryList } = industries;

   res.status(201).json({
      status: 'success',
      data: {
         industries: industryList
      }
   })
}) */

exports.updateIndustry = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const industry = await Industry.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
   })

   if (!industry) {
      return next(new AppError('No industry found with that Id', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         industry
      }
   })
})

exports.deleteIndustry = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const industry = await Industry.findByIdAndDelete(id)

   if (!industry) {
      return next(new AppError('No industry found with that Id', 404))
   }

   res.status(204).json({
      status: 'success',
      data: {
         industry
      }
   })
})