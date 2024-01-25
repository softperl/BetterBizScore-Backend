const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
   firstName: String,
   lastName: String,
   businessName: String,
   industry: String,
   email: String,
   areaCode: String,
   phoneNumber: String,
   address: String,
   address2: String,
   city: String,
   state: String,
   zip: String,
   userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Profile must belong to a user'],
      unique: [true, 'Profile already exists with this userId']
   }
})

const Profile = mongoose.model('Profile', profileSchema)

module.exports = Profile;