// @flow

import artifact from 'polymath-core_v2/build/contracts/SecurityToken.json'
import BigNumber from 'bignumber.js'

import Contract from './Contract'
import PermissionManager from './PermissionManager'
import TransferManager from './TransferManager'
import STO, { FUNDRAISE_ETH, FUNDRAISE_POLY } from './STO'
import { PolyToken } from '../'
import type { Address, Web3Receipt } from '../../types'

const MODULE_PERMISSION_MANAGER = 1
const MODULE_TRANSFER_MANAGER = 2
const MODULE_STO = 3

const LOG_MODULE_ADDED = 'LogModuleAdded'

export default class SecurityToken extends Contract {

  name: () => Promise<string>

  _decimals: number

  constructor (at: Address) {
    super(artifact, at)
  }

  async securityTokenVersion (): Promise<string> {
    return this._toAscii(await this._methods.securityTokenVersion().call())
  }

  async decimals (): Promise<number> {
    if (!this._decimals) {
      this._decimals = await this._methods.decimals().call()
    }
    return this._decimals
  }

  async tokenDetails (): Promise<string> {
    return this._toAscii(await this._methods.tokenDetails().call())
  }

  async addDecimals (n: number | BigNumber): Promise<BigNumber> {
    return new BigNumber(10).toPower(
      await this.decimals()
    ).times(n)
  }

  async removeDecimals (n: number | BigNumber): Promise<BigNumber> {
    return new BigNumber(n).div(new BigNumber(10).toPower(
      await this.decimals()
    ))
  }

  async verifyTransfer (from: Address, to: Address, amount: BigNumber): Promise<boolean> {
    return this._methods.verifyTransfer(from, to, this.addDecimals(amount)).call()
  }

  /** @private */
  async _getModule (_type: number): Promise<Address> {
    const events = await this._contractWS.getPastEvents(LOG_MODULE_ADDED, {
      filter: { _type },
      fromBlock: 0,
      toBlock: 'latest'
    })
    if (events.length) {
      return events[0].returnValues._module
    }
    throw new Error('module is not installed')
  }

  async getPermissionManager (): Promise<?PermissionManager> {
    try {
      return new PermissionManager(await this._getModule(MODULE_PERMISSION_MANAGER))
    } catch (e) {
      return null
    }
  }

  async getTransferManager (): Promise<?TransferManager> {
    try {
      return new TransferManager(await this._getModule(MODULE_TRANSFER_MANAGER))
    } catch (e) {
      return null
    }
  }

  async getSTO (): Promise<?STO> {
    try {
      return new STO(await this._getModule(MODULE_STO), this)
    } catch (e) {
      return null
    }
  }

  async withdrawPoly (amount: BigNumber): Promise<Web3Receipt> {
    return this._tx(
      this._methods.withdrawPoly(
        PolyToken.addDecimals(amount)
      )
    )
  }

  async transfer (to: Address, amount: BigNumber): Promise<Web3Receipt> {
    return this._tx(
      this._methods.transfer(
        to,
        this.addDecimals(amount)
      )
    )
  }

  async transferFrom (from: Address, to: Address, amount: BigNumber): Promise<Web3Receipt> {
    return this._tx(
      this._methods.transferFrom(
        from,
        to,
        this.addDecimals(amount)
      )
    )
  }

  async setSTO (
    factory: Address,
    start: Date,
    end: Date,
    cap: BigNumber,
    rate: BigNumber,
    isEth: boolean, // fundraise type, use true for ETH or false for POLY
    fundsReceiver: Address
  ): Promise<Web3Receipt> {
    const data = Contract.params.web3.eth.abi.encodeFunctionCall({
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
        type: 'uint256',
        name: '_rate'
      }, {
        type: 'uint8',
        name: '_fundRaiseType'
      }, {
        type: 'address',
        name: '_polyToken'
      }, {
        type: 'address',
        name: '_fundsReceiver'
      }]
    }, [
      this._toUnixTS(start),
      this._toUnixTS(end),
      this._toWei(cap),
      await this.addDecimals(rate),
      isEth ? FUNDRAISE_ETH : FUNDRAISE_POLY,
      PolyToken.address,
      fundsReceiver
    ])
    return this._tx(
      this._methods.addModule(
        factory,
        data,
        0,
        false
      )
    )
  }
}
