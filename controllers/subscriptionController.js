const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const moment = require('moment')
const Subscription = require('../models/subscriptionModel')
/* const User = require('../models/userModel') */
const AppError = require('../utils/appError')
const tryCatch = require('../utils/tryCatch')
const User = require('../models/userModel')
const Answer = require('../models/answerModel')

const YOUR_DOMAIN = 'http://localhost:3000';

exports.createCheckoutSession = tryCatch(async (req, res) => {
   const prices = await stripe.prices.list({
      expand: ['data.product'],
      lookup_keys: [req.body.lookup_key],
   });

   const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      line_items: [
         {
            quantity: 1,
            price: prices.data[0].id,
         },
      ],
      customer_email: req.user.email,
      metadata: {
         lookup_key: req.body.lookup_key
      },
      success_url: `${YOUR_DOMAIN}`,
      cancel_url: `${YOUR_DOMAIN}`,
   });
   res.status(200).json({ status: 'success', session })
});

const createSubscriptionCheckout = async (session) => {
   const { customer_email, payment_status } = session;

   if (payment_status === 'paid') {
      const subscriptionId = session.subscription;

      try {
         const subscription = await stripe.subscriptions.retrieve(subscriptionId);

         const { plan, current_period_start, current_period_end } = subscription;

         const startDate = moment.unix(current_period_start).format('YYYY-MM-DD');
         const endDate = moment.unix(current_period_end).format('YYYY-MM-DD');
         const durationInSeconds = current_period_end - current_period_start;
         const durationInDays = moment.duration(durationInSeconds, 'seconds').asDays();

         const user = await User.findOne({ email: customer_email });
         const latestAnswer = await Answer.findOne({ userId: user?._id }).sort({ submittedAt: -1 });
         await Subscription.create({
            userId: user?._id,
            planId: plan.id,
            amount: plan.amount,
            status: subscription.status,
            startDate,
            endDate,
            duration: durationInDays,
            paymentStatus: payment_status,
            lookupKey: session.metadata.lookup_key,
            industryId: latestAnswer?.[0]?.industryId,
         })

         console.log('Subscription completed successfully!')
      } catch (error) {
         console.log('⚠️ Error retrieving subscription', error);
      }
   }
}

exports.webhookCheckout = async (req, res) => {
   let event = req.body;
   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

   if (webhookSecret) {
      const signature = req.headers['stripe-signature'];

      try {
         event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookSecret
         );
      } catch (err) {
         console.log(`⚠️ Webhook signature verification failed.`, err.message);
         return res.status(400).send(`Webhook Error: ${err.message}`);
      }
   }

   if (event.type === "checkout.session.completed") {
      console.log('✅ SESSION OBJECT FROM webhookCheckout', event.data.object);
      await createSubscriptionCheckout(event.data.object);
   } else {
      console.log(`Unhandled event type ${event.type}.`);
   }

   res.status(200).json({ received: true })
}

exports.getAllSubscriptions = tryCatch(async (req, res, next) => {
   const subscriptions = await Subscription.find(req?.query || {}).sort({ createdAt: -1 }).populate('userId');
   res.status(200).json({
      status: 'success',
      results: subscriptions.length,
      data: {
         subscriptions
      }
   })
})

exports.getSubscription = tryCatch(async (req, res, next) => {
   const { id } = req.params
   const subscriptions = await Subscription.find({ userId: id, status: 'active' })

   if (!subscriptions) {
      return next(new AppError('No subscriptions found for this user', 404))
   }

   res.status(200).json({
      status: 'success',
      results: subscriptions.length,
      data: {
         subscriptions
      }
   })
})

// ** This Function Was Called From `userRoutes`
exports.getSubscriptionByUserId = tryCatch(async (req, res, next) => {
   const userId = req.user.id
   const industryId = req.query?.industryId;
   const subscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 });
   const checkIndustrySubscription = await Subscription.findOne({ userId, industryId });

   if (!subscriptions || !subscriptions.length || !subscriptions?.[0]) {
      return next(new AppError('No subscription found for this user', 404))
   }
   res.status(200).json({
      status: 'success',
      data: {
         subscription: subscriptions?.[0],
         alreadySubscribed: checkIndustrySubscription ? true : false,
      }
   })
})


/* // Fetch the Checkout Session to display the JSON result on the success page
app.get("/checkout-session")
exports.getCheckoutSessionDoc = async (req, res) => {
   const { sessionId } = req.query;
   const session = await stripe.checkout.sessions.retrieve(sessionId);
   res.send(session);
}; */


/* exports.createPortalSession = tryCatch(async (req, res) => {
   // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
   // Typically this is stored alongside the authenticated user in your database.
   const { session_id } = req.body;
   const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

   // This is the url to which the customer will be redirected when they are done
   // managing their billing with the portal.
   const returnUrl = YOUR_DOMAIN;

   const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer,
      return_url: returnUrl,
   });

   res.redirect(303, portalSession.url);
}); */
