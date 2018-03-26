// @flow

import artifact from 'polymath-core_v2/build/contracts/TickerRegistry.json'

import Contract from './Contract'

import type { Address, SymbolDetails } from '../../types'

const LOG_REGISTER_TICKER = 'LogRegisterTicker'

class TickerRegistry extends Contract {

  expiryLimit: () => Promise<number>

  async getDetails (symbol: string): Promise<?SymbolDetails> {
    let [owner, timestamp, contact, status] = this._toArray(await this._methods.getDetails(symbol).call())
    if (this._isEmptyAddress(owner)) {
      return null
    }
    timestamp = new Date(timestamp * 1000)
    let expires
    if (!status) {
      const expiryLimit = await this.expiryLimit() * 1000
      expires = new Date(timestamp.getTime() + expiryLimit)
    }
    return {
      owner,
      timestamp,
      contact,
      status,
      ticker: symbol,
      expires,
    }
  }

  async getDetailsByOwner (_owner: Address): Promise<?SymbolDetails> {
    const events = await this._contractWS.getPastEvents(LOG_REGISTER_TICKER, {
      filter: { _owner },
      fromBlock: 0,
      toBlock: 'latest'
    })

    for (let event of events) {
      const details = await this.getDetails(event.returnValues._symbol)
      if (details !== null) {
        return details
      }
    }
    return null
  }
}

export default new TickerRegistry(artifact)
