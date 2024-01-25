const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Every subscription should belong to a user']
   },
   planId: String,
   amount: Number,
   status: String,
   startDate: Date,
   endDate: Date,
   duration: Number,
   paymentStatus: String,
   expiresAt: Date,
   industryId: String,
   lookupKey: {
      type: String,
      required: [true, 'Every subscription must have a lookup key']
   }
}, {
   timestamps: {
      createdAt: true,
      updatedAt: false,
   },
})

const Subscription = mongoose.model('Subscription', subscriptionSchema)

module.exports = Subscription;