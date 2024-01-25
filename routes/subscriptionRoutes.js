const express = require('express')

const {
   protect,
   isAdmin
} = require('../controllers/authenticationController')

const {
   createCheckoutSession,
   getAllSubscriptions,
   getSubscription,
   /* createPortalSession */
} = require('../controllers/subscriptionController')

const router = express.Router()

router.use(protect)

/* router.post('/create-portal-session', createPortalSession) */
router.post('/create-checkout-session', createCheckoutSession)

router.route('/').get(isAdmin, getAllSubscriptions)
router.route('/:id').get(getSubscription)

/* router.post('/webhook-checkout', webhookCheckout)
router.post('/checkoutSession', protect, getCheckoutSession) */

module.exports = router;