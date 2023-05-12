import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import {
  expressLogger,
  expressErrorLogger
} from './logger'

const PORT = 4000

const main = async () => {
  // https express server
  const app = express()
  // middleware
  app.use((req, res, next) => {
    // headers
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    next()
  })
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())
  app.use(compression())
  app.use(helmet())
  // logger
  app.use(expressLogger)
  // routes
  // TODO: handle routes
  // error logger
  app.use(expressErrorLogger)
  // error handler
  app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.status || 500)
    res.end()
  })
  // listen
  app.listen(PORT)
}

main()