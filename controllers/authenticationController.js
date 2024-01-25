const { promisify } = require('util')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const User = require('../models/userModel')
const AppError = require('../utils/appError')
const Email = require('../utils/email')
const tryCatch = require('../utils/tryCatch')

const signToken = (id, admin) => {
   return jwt.sign({ id, admin }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
   })
}

const createSendToken = (user, statusCode, req, res) => {
   const token = signToken(user._id, user.admin)

   const cookieOptions = {
      expires: new Date(
         Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
      ),
      sameSite: 'none',
      secure: true,
      httpOnly: true
   }

   /* if (process.env.NODE_ENV === 'production') {
      cookieOptions.sameSite = 'none',
         cookieOptions.secure =
         req.secure || req.headers['x-forwarded-proto'] === 'https'
   } */

   res.cookie('__token_bzc_client', token, cookieOptions)

   user.password = undefined;

   res.status(statusCode).json({
      status: 'success',
      token,
      data: {
         user
      }
   })
}

exports.signup = tryCatch(async (req, res, next) => {
   const { name, email, password, passwordConfirm } = req.body;

   const verifyToken = crypto.randomBytes(32).toString('hex')

   const user = await User.create({
      name, email, password, passwordConfirm, verifyToken
   })

   const receiver = {
      name: user.name,
      email: user.email
   }

   const verifyURL = `http://localhost:3000/verifyEmail/${user.verifyToken}`;

   try {
      await new Email(receiver, verifyURL).sendVerifyEmail()

   } catch (error) {
      console.log('There was an error while sending email')
   }

   createSendToken(user, 201, req, res)
})

exports.login = tryCatch(async (req, res, next) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return next(new AppError('Please provide email and password', 400))
   }

   const user = await User.findOne({ email }).select('+password')

   if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401))
   }

   if (!user.verified) {
      const receiver = {
         name: user.name,
         email: req.body.email
      };

      const verifyURL = `http://localhost:3000/verifyEmail/${user.verifyToken}`;

      try {
         await new Email(receiver, verifyURL).sendVerifyEmail()

      } catch (error) {
         console.log('There was an error while sending email')
      }
   }

   createSendToken(user, 200, req, res)
})

exports.verifyEmail = tryCatch(async (req, res, next) => {
   const user = await User.findOne({ verifyToken: req.params.token })

   if (!user) {
      return next(new AppError('There is no one to verify with this token', 404))
   }

   user.verified = true;
   user.verifyToken = undefined;

   await user.save({ validateBeforeSave: false });
   res.status(200).json({
      status: 'success',
      verified: user.verified,
      message: 'Your email verification was successful!'
   })
})

exports.logout = (req, res) => {
   res.cookie('__token_bzc_client', 'eyJpZCI6IjY1NzA2NjIwMTJhYzAOjE3MDQ1NjMNjh9.T3oDOqTSGjAdUu9ScA-PdvHzQreAeBcoiBRsOTXwUAY', {
      expires: new Date(Date.now() + 10 * 1000),
      sameSite: 'none',
      secure: true
   })

   res.status(200).json({ status: 'success' });
}

exports.protect = tryCatch(async (req, res, next) => {
   let token;

   console.log(req.cookies?.__token_bzc_client);

   if (req.cookies?.__token_bzc_client) {
      token = req.cookies.__token_bzc_client;
   }
   else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
   }

   if (!token) {
      return next(new AppError('You are not logged in! please log in to get access', 401))
   }

   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

   const currentUser = await User.findById(decoded.id)
   if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist', 401))
   }

   if (currentUser.changesPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please log in again', 401))
   }

   req.user = currentUser;
   next()
})

exports.isAdmin = (req, res, next) => {
   if (!req.user.admin) {
      return next(new AppError(
         'You do not have permission to perform this action', 403
      ))
   }
   next()
}

exports.forgotPassword = tryCatch(async (req, res, next) => {
   const user = await User.findOne({ email: req.body.email })

   if (!user) {
      return next(new AppError('There is no user with this email address', 404))
   }

   const resetToken = user.createPasswordResetToken()
   await user.save({ validateBeforeSave: false })

   const receiver = {
      name: user.name,
      email: req.body.email
   };

   const resetURL = `http://localhost:3000/resetPassword/${resetToken}`;

   try {
      await new Email(receiver, resetURL).sendForgotEmail()

      res.status(200).json({
         status: 'success',
         message: 'Password reset link is sent to your email!'
      })
   } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({ validateBeforeSave: false })

      return next(new AppError('There was an error sending the email. Try again later!', 500))
   }
})

exports.resetPassword = tryCatch(async (req, res, next) => {
   const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

   const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })

   console.log(user);

   if (!user) {
      return next(new AppError('Token is invalid or has expired', 400))
   }

   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   user.passwordResetToken = undefined;
   user.passwordResetExpires = undefined;
   await user.save()

   /* 3 -> Update changePasswordAt property for the user */
   /* 4 -> Log the user in, send JWT */
   createSendToken(user, 200, req, res)
})

exports.updatePassword = tryCatch(async (req, res, next) => {
   const user = await User.findById(req.user.id).select('+password')

   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong', 401))
   }

   user.password = req.body.password
   user.passwordConfirm = req.body.passwordConfirm
   await user.save()

   createSendToken(user, 200, req, res)
})