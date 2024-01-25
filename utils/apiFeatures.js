module.exports = (req, Model) => {
   // ** Filtering
   const queryObj = { ...req.query }

   const excludedFields = ['page', 'sort', 'limit', 'fields']
   excludedFields.forEach(el => delete queryObj[el])

   let queryStr = JSON.stringify(queryObj)
   queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)

   let query = Model.find(JSON.parse(queryStr))

   // ** Sorting
   if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
   } else {
      query = query.sort('-discount')
   }

   // ** Limiting Fields
   if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      query = query.select(fields)
   } else {
      query = query.select('-__v')
   }

   /** Pagination
   const page = req.query.page * 1 || 1;
   const limit = req.query.limit * 1 || 100;

   const skip = (page - 1) * limit;
   query = query.skip(skip).limit(limit) */

   return query;
}