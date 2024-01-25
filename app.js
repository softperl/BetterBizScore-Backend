const path = require('path')
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const compression = require('compression')

const Email = require("./utils/email")

const userRouter = require('./routes/userRoutes')
const profileRouter = require('./routes/profileRoutes')
const industryRouter = require('./routes/industryRoutes')
const categoryRouter = require('./routes/categoryRoutes')
const questionRouter = require('./routes/questionRoutes')
const answersRouter = require('./routes/answersRoutes')
const packageRouter = require('./routes/packageRoutes')
const subscriptionRouter = require('./routes/subscriptionRoutes')
/* const viewRouter = require('./routes/viewRoutes') */
const { webhookCheckout } = require('./controllers/subscriptionController')
const globalErrorHandler = require('./controllers/errorController')

const app = express();

/* app.enable('trust proxy'); */

// ** Setting Pug as View Engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// ** Serving Static Files
app.use(express.static(path.join(__dirname, 'public')))

if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'))
}

// ** Set Security HTTP Headers
app.use(helmet())

// ** Limiting Request From One IP
const limiter = rateLimit({
   max: 2000,
   windowMs: 60 * 60 * 1000,
   message: 'Too many requests from this IP, please try again in an hour!'
})

app.use('/api', limiter)


// ** cross origin resource sharing
// TODO: Specify the origin
app.use(cors({
   origin: ['http://localhost:3000','http://localhost:3001'],
   credentials: true
}))



app.post('/webhook-checkout', express.raw({ type: 'application/json' }), webhookCheckout)

// ** `body-parser`, Reading Data From `body` Into `req.body`
app.use(express.json({
   limit: '200kb',
   verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
         req.rawBody = buf.toString();
      }
   },
}))
app.use(express.urlencoded({ extended: true, limit: '200kb' }))
app.use(cookieParser())

// ** Data Sanitization Against NoSQL Query Injection
app.use(mongoSanitize())

// ** Data Sanitization Against XSS
app.use(xss())

// ** Prevent Parameter Pollution
/* app.use(hpp({ whitelist: ['brand', 'price', 'size', 'tags'] })) */

app.use(compression());

/* app.use('/', viewRouter) */
app.use('/api/users', userRouter);
app.use('/api/profiles', profileRouter);
app.use('/api/industries', industryRouter)
app.use('/api/categories', categoryRouter);
app.use('/api/questions', questionRouter);
app.use('/api/answers', answersRouter);
app.use('/api/packages', packageRouter);
app.use('/api/subscriptions', subscriptionRouter);

app.get('/', (req, res, next) => {
   res.status(200).json({
      status: 'success',
      message: 'Server running successfully!'
   })
})

app.post('/sendContactEmail', async (req, res, next) => {
   const receiver = {
      name: process.env.CONTACT_REC_NAME,
      email: process.env.CONTACT_REC_EMAIL
   }

   try {
      await new Email(receiver, 'http://localhost:3000').sendContactEmail(req.body)

      res.status(200).json({
         status: 'success',
         message: `Hello ${req.body.name}, We received your email. We will reach out to you shortly!`
      })
   } catch (error) {
      return next(new AppError('There was an error sending the email. Try again later!', 500))
   }
})

app.all('*', (req, res) => {
   res.status(500).json({
      status: 'fail',
      message: 'No such route exists on this server!'
   })
})

app.use(globalErrorHandler)

module.exports = app;