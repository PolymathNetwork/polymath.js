// @flow

import artifact from 'polymath-core/build/contracts/GeneralTransferManager.json'

import Contract from './Contract'
import type { Address, Investor, Web3Receipt } from '../../types'

const LOG_MODIFY_WHITELIST = 'LogModifyWhitelist'

export default class TransferManager extends Contract {

  paused: () => Promise<boolean>

  pause: () => Promise<Web3Receipt>
  unpause: () => Promise<Web3Receipt>

  constructor (at: Address) {
    super(artifact, at)
  }

  async modifyWhitelist (investor: Investor): Promise<Web3Receipt> {
    return this._tx(
      this._methods.modifyWhitelist(
        investor.address,
        this._toUnixTS(investor.from),
        this._toUnixTS(investor.to),
        this._toUnixTS(investor.expiry),
      ),
      null,
      2
    )
  }

  async modifyWhitelistMulti (investors: Array<Investor>): Promise<Web3Receipt> {
    const addresses: Array<string> = []
    const fromTimes: Array<number> = []
    const toTimes: Array<number> = []
    const expiryTimes: Array<number> = []

    for (let investor of investors) {
      addresses.push(investor.address)
      fromTimes.push(this._toUnixTS(investor.from))
      toTimes.push(this._toUnixTS(investor.to))
      expiryTimes.push(this._toUnixTS(investor.expiry))
    }

    return this._tx(
      this._methods.modifyWhitelistMulti(addresses, fromTimes, toTimes, expiryTimes),
      null,
      2
    )
  }

  async getWhitelist (): Promise<Array<Investor>> {
    const result = []
    const events = await this._contractWS.getPastEvents(LOG_MODIFY_WHITELIST, {
      fromBlock: 0,
      toBlock: 'latest'
    })

    for (let event of events) {
      result.push({
        address: event.returnValues._investor,
        addedBy: event.returnValues._addedBy,
        added: this._toDate(event.returnValues._dateAdded),
        from: this._toDate(event.returnValues._fromTime),
        to: this._toDate(event.returnValues._toTime),
        expiry: this._toDate(event.returnValues._expiryTime),
      })
    }
    return result
  }
}
