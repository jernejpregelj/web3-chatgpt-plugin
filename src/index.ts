import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import {
  expressLogger,
  expressErrorLogger
} from './logger'

import WalletsRouter from './routes/WalletsRouter'
import ContractsRouter from './routes/ContractsRouter'

const PORT = 4000

const main = async () => {
  // express server
  const app = express()
  app.use(cors())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())
  app.use(compression())
  app.use(helmet())
  // logger
  app.use(expressLogger)
  // static info routes
  app.use('/.well-known', express.static('public'))
  // dynamic routes
  app.use('/wallets', WalletsRouter)
  app.use('/contracts', ContractsRouter)
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