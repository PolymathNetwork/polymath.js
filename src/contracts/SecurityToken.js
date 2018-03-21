import artifact from 'polymath-core_v2/build/contracts/SecurityToken.json'
import BigNumber from 'bignumber.js'

import Contract from './Contract'
import TransferManager from './TransferManager'
import STO from './STO'

const TRANSFER_MANAGER_TYPE = 1
const STO_TYPE = 2

const LOG_MODULE_ADDED = 'LogModuleAdded'

export default class SecurityToken extends Contract {
  _decimals: number

  constructor (at: string) {
    super(artifact, at)
  }

  async decimals (): Promise<number> {
    if (!this._decimals) {
      const decimals = await this._methods.decimals().call()
      this._decimals = decimals.toNumber()
    }
    return this._decimals
  }

  async addDecimals (n): Promise<BigNumber> {
    return new BigNumber(10).toPower(
      await this.decimals()
    ).times(n)
  }

  async removeDecimals (n): Promise<BigNumber> {
    return new BigNumber(n).div(new BigNumber(10).toPower(
      await this.decimals()
    ))
  }

  async getTransferManager (): Promise<?TransferManager> {
    const events = await this._contractWS.getPastEvents(LOG_MODULE_ADDED, {
      filter: { _type: TRANSFER_MANAGER_TYPE },
      fromBlock: 0,
      toBlock: 'latest'
    })

    if (events.length) {
      return new TransferManager(events[0].returnValues._module)
    }
    return null
  }

  async setSTO (factory: string, start: Date, end: Date, cap: BigNumber, rate: BigNumber) {
    const data = Contract._web3.eth.abi.encodeFunctionCall({
      name: 'configure',
      type: 'function',
      inputs: [{
        type: 'uint256',
        name: '_startTime'
      }, {
        type: 'uint256',
        name: '_endTime'
      }, {
        type: 'uint256',
        name: '_cap'
      }, {
        type: 'uint',
        name: '_rate'
      }]
    }, [
      this._toUnixTS(start),
      this._toUnixTS(end),
      this._toWei(cap),
      await this.addDecimals(rate)
    ])
    return this._tx(this._methods.addModule(
      factory,
      data,
      0,
      [],
      false
    ))
  }

  async getSTO (): Promise<?STO> {
    const events = await this._contractWS.getPastEvents(LOG_MODULE_ADDED, {
      filter: { _type: STO_TYPE },
      fromBlock: 0,
      toBlock: 'latest'
    })

    if (events.length) {
      return new STO(events[0].returnValues._module, this)
    }
    return null
  }

  async transfer (to: string, amount: BigNumber) {
    return this._tx(this._methods.transfer(to, this.addDecimals(amount)))
  }

  async transferFrom (from: string, to: string, amount: BigNumber) {
    return this._tx(this._methods.transferFrom(from, to, this.addDecimals(amount)))
  }
}
