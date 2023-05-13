import express from 'express'
import { body, validationResult, param } from 'express-validator'
import ethers, { utils, Wallet } from 'ethers'

export class WalletsRouter {
  router: express.Router

  constructor () {
    this.router = express.Router()
  }

  createWalletInputs = [
  ]

  public async createWallet (req: express.Request, res: express.Response) {
    // validations
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(422).send({ errors: result.array() });
    }
    // execute
    const seedphrase = utils.entropyToMnemonic(utils.randomBytes(16))
    const web3Wallet = await Wallet.fromMnemonic(seedphrase, "m/44'/60'/0'/0/0")
    return res.send({ seedphrase, address: web3Wallet.address })
  }

  createWalletWithSeedphraseInputs = [
    body('seedphrase').isString().notEmpty()
  ]

  public async createWalletWithSeedphrase (req: express.Request, res: express.Response) {
    // validations
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(422).send({ errors: result.array() });
    }
    // execute
    const web3Wallet = await Wallet.fromMnemonic(req.body.seedphrase, "m/44'/60'/0'/0/0")
    return res.send({ seedphrase: req.body.seedphrase, address: web3Wallet.address })
  }

  init () {
    this.router.post('/', this.createWalletInputs, this.createWallet)
    this.router.post('/seedphrase', this.createWalletWithSeedphraseInputs, this.createWalletWithSeedphrase)
  }
}

const walletsRoutes = new WalletsRouter()
walletsRoutes.init()

export default walletsRoutes.router
