const Answer = require("../models/answerModel")
const Category = require("../models/categoryModel")
const Industry = require("../models/industryModel")
const User = require("../models/userModel")
const AppError = require('../utils/appError')
const tryCatch = require('../utils/tryCatch')


exports.getAnswer = tryCatch(async (req, res, next) => {
   try {
      const { userId } = req.params;
      const { answerId } = req.query;
      let query = { userId };
      if (answerId) {
         query._id = answerId;
      };
      const answers = await Answer.find(query);
      if (!answers) {
         return next(new AppError('No answers found which belongs to this user', 404))
      }

      const latestAnswer = answers?.length ? answers.reduce(
         (prev, current) => {
            return (new Date(current?.submittedAt) > new Date(prev?.submittedAt)) ? current : prev;
         }) : {};

      const latestAnswerFormated = latestAnswer?.answers ? Object.entries(latestAnswer?.answers)
         .reduce((prevRes, [catName, quesAns]) => {
            const points = Object.entries(quesAns).reduce(
               (acc, ans) => Number(ans[1]?.points) + acc,
               0
            )
            const totalPoints = Object.entries(quesAns).reduce(
               (acc, ans) => Number(ans[1]?.totalPoints) + acc,
               0
            )
            return [...prevRes, { name: catName, points, totalPoints }];
         }, []) : null;

      const suggestionMap = new Map();

      (latestAnswerFormated || []).map(latestAnswer => {
         suggestionMap.set(latestAnswer.name, latestAnswer);
      })

      const categoryArray = await Category.find({ name: { $in: (latestAnswerFormated || []).map(latestAnswer => latestAnswer?.name) } })

      for await (const cat of (categoryArray || [])) {
         const matchSuggestion = suggestionMap.get(cat?.name);
         if (matchSuggestion && matchSuggestion?.points) {
            for (let index = 0; index < cat.suggestions?.length; index++) {
               const element = cat.suggestions[index];
               const percentage = (matchSuggestion?.points || 0) / (matchSuggestion?.totalPoints || 1) * 100;
               if (percentage?.toFixed(2) >= element?.from && percentage?.toFixed(2) <= element?.to) {
                  suggestionMap.set(cat.name, { ...matchSuggestion, suggestion: element.suggestion, percentage: Number(percentage?.toFixed(2)) })
                  break;
               }
            }
         }
      }

      res.status(200).json({
         status: 'success',
         results: answers?.length,
         data: {
            answers,
            suggestions: [...suggestionMap].map(([name, value]) => ({ name, value })),
         }
      })
   } catch (error) {
      console.log(error)
   }
})

exports.postAnswer = tryCatch(async (req, res, next) => {
   const { industry, answers, scoredPoints, totalPoints } = req.body;
   const industryInfo = await Industry.findOne({ name: industry });
   const newAnswer = await Answer.create({
      userId: req.user._id,
      industryId: industryInfo?._id,
      industry,
      answers,
      totalPoints,
      scoredPoints,
   });
   await User.findOneAndUpdate({ _id: req.user._id }, { $set: { industryId: industryInfo?._id } })

   res.status(201).json({
      status: 'success',
      data: {
         answer: newAnswer
      }
   })
})