const mongoose = require('mongoose')
const dotenv = require('dotenv')

process.on('uncaughtException', (error) => {
   console.log('UncaughtException 💥 Shutting Down...')
   console.log(error.name, error.message)

   process.exit(1)
})

dotenv.config({ path: './config.env' })
const app = require('./app')

/* TODO: Change the process variable names */
const DATABASE_URI = process.env.DATABASE_URL.replace('<password>', process.env.DATABASE_PASSWORD);

/* const DATABASE_URI = 'mongodb://127.0.0.1:27017/test'; */

mongoose.connect(DATABASE_URI).then(() =>
   console.log('Database connection successful')
)

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
   console.log(`Server listening on port ${PORT}`)
})

process.on('unhandledRejection', (error) => {
   console.log('UnhandledRejection 💥 Shutting Down...')
   console.log(error.name, error.message)

   server.close(() => {
      process.exit(1)
   })
})

process.on('SIGTERM', () => {
   console.log('SIGTERM received. Shutting Down...')

   server.close(() => {
      console.log('Process Terminated 💥')
   })
})