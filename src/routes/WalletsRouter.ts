import express from 'express'
import { body, validationResult, param } from 'express-validator'
import ethers, { utils, Wallet, providers } from 'ethers'

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

  walletAddressFromSeedphraseInputs = [
    body('seedphrase').isString().notEmpty()
  ]

  public async walletAddressFromSeedphrase (req: express.Request, res: express.Response) {
    // validations
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(422).send({ errors: result.array() });
    }
    // execute
    const web3Wallet = await Wallet.fromMnemonic(req.body.seedphrase, "m/44'/60'/0'/0/0")
    return res.send({ address: web3Wallet.address })
  }

  walletBalanceForSeedphraseInputs = [
    body('seedphrase').isString().notEmpty(),
  ]

  public async walletBalanceForSeedphrase (req: express.Request, res: express.Response) {
    // validations
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(422).send({ errors: result.array() });
    }
    // execute
    const web3Wallet = await Wallet.fromMnemonic(req.body.seedphrase, "m/44'/60'/0'/0/0")
    const provider = new providers.JsonRpcProvider('https://ethereum.publicnode.com')
    const balance = (await provider.getBalance(web3Wallet.address)).toString()
    // get balance
    return res.send({ balance })
  }

  init () {
    this.router.post('/', this.createWalletInputs, this.createWallet)
    this.router.post('/walletaddress', this.walletAddressFromSeedphraseInputs, this.walletAddressFromSeedphrase)
    this.router.post('/walletbalance', this.walletBalanceForSeedphraseInputs, this.walletBalanceForSeedphrase)
  }
}

const walletsRoutes = new WalletsRouter()
walletsRoutes.init()

export default walletsRoutes.router
