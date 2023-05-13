import express from 'express'
import { body, validationResult } from 'express-validator'
import { Wallet, providers, ContractFactory } from 'ethers'
import { networks } from '../networks'
// @ts-ignore
import solc from 'solc'

export class ContractsRouter {
  router: express.Router

  constructor () {
    this.router = express.Router()
  }

  deployContractInputs = [
    body('seedphrase').isString().notEmpty(),
    body('network').isString().notEmpty(),
    body('code').isString().notEmpty()
  ]

  public async deployContract (req: express.Request, res: express.Response) {
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
    // deploy
    try {
      const web3Wallet = await Wallet.fromMnemonic(req.body.seedphrase, network.derivationPath + "0")
      const provider = new providers.JsonRpcProvider(network.rpc)
      const web3Provider = web3Wallet.connect(provider)
      const input = {
        language: 'Solidity',
        sources: {
          'main.sol': {
            content: "// SPDX-License-Identifier: MIT\n" + req.body.code
          }
        },
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          evmVersion: "byzantium",
          outputSelection: {
            '*': {
              '*': ['abi', 'evm.bytecode']
            }
          }
        }
      }
      const output = JSON.parse(solc.compile(JSON.stringify(input)))
      const contractInfo = output.contracts['main.sol'][Object.keys(output.contracts['main.sol'])[0]]
      const abi = contractInfo.abi
      const bytecode = contractInfo.evm.bytecode
      const factory = new ContractFactory(abi, bytecode, web3Provider)
      const contract = await factory.deploy()
      await contract.deployTransaction.wait()
      return res.send({ address: contract.address, abi, detailsLink: network.txexplorer + contract.deployTransaction.hash })
    } catch (e) {
      return res.status(500)
    }
  }

  init () {
    this.router.post('/deploycontract', this.deployContractInputs, this.deployContract)
  }
}

const contractsRoutes = new ContractsRouter()
contractsRoutes.init()

export default contractsRoutes.router
