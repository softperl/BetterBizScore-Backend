const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Please provide your name!']
   },
   email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
   },
   verified: {
      type: Boolean,
      default: false
   },
   verifyToken: String,
   password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
   },
   passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
         validator: function (pc) {
            return pc === this.password;
         },
         message: 'Passwords are not the same!'
      }
   },
   admin: {
      type: Boolean,
      default: false
   },
   passwordChangedAt: Date,
   passwordResetToken: String,
   passwordResetExpires: Date,
   industryId: String,
})

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next()

   const salt = await bcrypt.genSalt(12)
   this.password = await bcrypt.hash(this.password, salt);

   this.passwordConfirm = undefined;

   next()
})

userSchema.pre('save', function (next) {
   if (!this.isModified('password') || this.isNew) return next();

   this.passwordChangedAt = Date.now() - 1000
   next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
   return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
   if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

      return JWTTimestamp < changedTimestamp
   }

   return false;
}

userSchema.methods.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(32).toString('hex')

   this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

   console.log({ resetToken }, this.passwordResetToken);

   this.passwordResetExpires = Date.now() + 15 * 60 * 1000;

   return resetToken;
}

const User = mongoose.model('User', userSchema)

module.exports = User;