import express from 'express'
import { body, validationResult, param } from 'express-validator'
import ethers, { utils, Wallet, providers } from 'ethers'
import { networks } from '../networks'
import { getDisplayBalance, fromDisplayBalance } from '../helper'

export class WalletsRouter {
  router: express.Router

  constructor () {
    this.router = express.Router()
  }

  createWalletInputs = [
    body('network').isString().notEmpty()
  ]

  public async createWallet (req: express.Request, res: express.Response) {
    // validations
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(422).send({ errors: result.array() });
    }
    const network = networks.find((c:any) => c.name.toLowerCase() === req.body.network.toLowerCase())
    if (network === undefined) {
      return res.status(422).send({ errors: [{
        location: 'body',
        msg: 'Missing value',
        path: 'network',
        type: 'field'
      }]})
    }
    // execute
    const seedphrase = utils.entropyToMnemonic(utils.randomBytes(16))
    const web3Wallet = await Wallet.fromMnemonic(seedphrase, network.derivationPath + "0")
    return res.send({ seedphrase, address: web3Wallet.address, network: network.name })
  }

  walletAddressFromSeedphraseInputs = [
    body('seedphrase').isString().notEmpty(),
    body('network').isString().notEmpty()
  ]

  public async walletAddressFromSeedphrase (req: express.Request, res: express.Response) {
    // validations
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(422).send({ errors: result.array() });
    }
    const network = networks.find((c:any) => c.name.toLowerCase() === req.body.network.toLowerCase())
    if (network === undefined) {
      return res.status(422).send({ errors: [{
        location: 'body',
        msg: 'Missing value',
        path: 'network',
        type: 'field'
      }]})
    }
    // execute
    const web3Wallet = await Wallet.fromMnemonic(req.body.seedphrase, network.derivationPath + "0")
    return res.send({ address: web3Wallet.address })
  }

  walletBalanceForSeedphraseInputs = [
    body('seedphrase').isString().notEmpty(),
    body('network').isString().notEmpty()
  ]

  public async walletBalanceForSeedphrase (req: express.Request, res: express.Response) {
    // validations
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(422).send({ errors: result.array() });
    }
    const network = networks.find((c:any) => c.name.toLowerCase() === req.body.network.toLowerCase())
    if (network === undefined) {
      return res.status(422).send({ errors: [{
        location: 'body',
        msg: 'Missing value',
        path: 'network',
        type: 'field'
      }]})
    }
    // execute
    const web3Wallet = await Wallet.fromMnemonic(req.body.seedphrase, network.derivationPath + "0")
    const provider = new providers.JsonRpcProvider(network.rpc)
    const balance = await provider.getBalance(web3Wallet.address)
    // get balance
    return res.send({ balance: getDisplayBalance(balance.toString(), '18') + " " + network.currency })
  }

  walletTransferForSeedphraseInputs = [
    body('seedphrase').isString().notEmpty(),
    body('network').isString().notEmpty(),
    body('address').isString().notEmpty(),
    body('amount').isString().notEmpty()
  ]

  public async walletTransferForSeedphrase (req: express.Request, res: express.Response) {
    // validations
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(422).send({ errors: result.array() });
    }
    const network = networks.find((c:any) => c.name.toLowerCase() === req.body.network.toLowerCase())
    if (network === undefined) {
      return res.status(422).send({ errors: [{
        location: 'body',
        msg: 'Missing value',
        path: 'network',
        type: 'field'
      }]})
    }
    // execute
    try {
      const web3Wallet = await Wallet.fromMnemonic(req.body.seedphrase, network.derivationPath + "0")
      const provider = new providers.JsonRpcProvider(network.rpc)
      const web3Provider = web3Wallet.connect(provider)
      const tx = await web3Provider.sendTransaction({from: web3Wallet.address, to: req.body.address, value: fromDisplayBalance(req.body.amount, '18')})
      return res.send({ transactionId: tx.hash, transactionLink: network.txexplorer + tx.hash })
    } catch (e) {
      return res.status(500)
    }
  }

  init () {
    this.router.post('/', this.createWalletInputs, this.createWallet)
    this.router.post('/walletaddress', this.walletAddressFromSeedphraseInputs, this.walletAddressFromSeedphrase)
    this.router.post('/walletbalance', this.walletBalanceForSeedphraseInputs, this.walletBalanceForSeedphrase)
    this.router.post('/wallettransfer', this.walletTransferForSeedphraseInputs, this.walletTransferForSeedphrase)
  }
}

const walletsRoutes = new WalletsRouter()
walletsRoutes.init()

export default walletsRoutes.router
