import artifact from 'polymath-core_v2/build/contracts/TickerRegistrar.json'

import Contract from './Contract'

import type { SymbolDetails } from './types'

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
      status
    }
  }
}

export default new TickerRegistrar(artifact)
