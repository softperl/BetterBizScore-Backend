const mongoose = require('mongoose')

const industrySchema = new mongoose.Schema({
   name: {
      type: String,
      unique: true,
      required: [true, 'Please provide a industry name']
   },
   categories: [
      {
         type: mongoose.Schema.ObjectId,
         ref: "Category"
      }
   ]
})

/* industrySchema.pre(/^find/, function (next) {
   this.populate({
      path: 'categories'
   })

   next()
}) */

/* const industrySchema = new mongoose.Schema({
   industries: [String]
}, {
   __v: false
})

industrySchema.methods.addIndustry = function (newIndustry) {
   if (this.industries.includes(newIndustry)) {
      return;
   }

   this.industries.push(newIndustry);
   return this.save();
}; */

const Industry = mongoose.model("Industry", industrySchema);

module.exports = Industry;