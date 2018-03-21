import artifact from 'polymath-core_v2/build/contracts/TickerRegistrar.json'

import Contract from './Contract'

import type { SymbolDetails } from './types'

const LOG_REGISTER_TICKER = 'LogRegisterTicker'

class TickerRegistrar extends Contract {
  async getDetails (symbol: string): Promise<?SymbolDetails> {
    const [owner, timestamp, contact, status] = await this._methods.getDetails(symbol).call()
    if (this._isEmptyAddress(owner)) {
      return null
    }
    return {
      owner,
      timestamp: new Date(timestamp * 1000),
      contact,
      status,
      ticker: symbol
    }
  }

  async getDetailsByOwner (_owner: string): Promise<?SymbolDetails> {
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

export default new TickerRegistrar(artifact)
