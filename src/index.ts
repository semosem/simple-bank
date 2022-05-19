import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import routes from './routes'

import * as dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost/db'

const app = express()

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.use(bodyParser.json())

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('connected'))
  .catch(e => console.log(e))

app.use('/api', routes)

app.listen(PORT, function () {
  console.log('running on port 3000')
})
