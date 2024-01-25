const mongoose = require('mongoose')

const packageSchema = new mongoose.Schema({
   name: {
      type: String,
      unique: true,
      required: [true, 'Every package must have a name']
   },
   price: {
      type: Number,
      required: [true, 'Every package must have a price']
   },
   description: String,
   features: [String],
   lookupKey: {
      type: String,
      unique: true,
      required: [true, 'Every package must have a lookup key']
   }
})

const Package = mongoose.model('Package', packageSchema)

module.exports = Package;