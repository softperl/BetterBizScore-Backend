const express = require('express')

const {
   signup,
   login,
   logout,
   verifyEmail,
   protect,
   isAdmin,
   forgotPassword,
   resetPassword,
   updatePassword
} = require('../controllers/authenticationController')

const {
   getSubscriptionByUserId
} = require('../controllers/subscriptionController')

const {
   getProfileByUserId
} = require('../controllers/profileController')

const {
   getAllUsers,
   getUser,
   createUser,
   updateUser,
   deleteUser
} = require('../controllers/userController')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)

router.route('/verifyEmail/:token').get(verifyEmail)

router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

router.use(protect)

router.patch('/updatePassword', updatePassword)

router.get('/profile', getProfileByUserId)
router.get('/subscription', getSubscriptionByUserId)

router.use(isAdmin)

router.route('/')
   .get(getAllUsers)
   .post(createUser)

router.route('/:id')
   .get(getUser)
   .patch(updateUser)
   .delete(deleteUser)

module.exports = router;