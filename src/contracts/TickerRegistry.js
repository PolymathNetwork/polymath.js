// @flow

import artifact from 'polymath-core/build/contracts/TickerRegistry.json'

import Contract from './Contract'
import IPFS from '../IPFS'

import type { SymbolDetails, Web3Event, Web3Receipt } from '../../types'

const LOG_REGISTER_TICKER = 'LogRegisterTicker'

type TickerIPFS = {
}

class TickerRegistry extends Contract {

  expiryLimit: () => Promise<number>

  async _getRegisterTickerEvents (): Promise<Array<Web3Event>> {
    return await this._contractWS.getPastEvents(LOG_REGISTER_TICKER, {
      filter: { _owner: this.account },
      fromBlock: 0,
      toBlock: 'latest'
    })
  }

  async getDetails (symbol: string, txHash?: string): Promise<?SymbolDetails> {
    let [owner, timestamp, name, swarmHash, status] = this._toArray(await this._methods.getDetails(symbol).call())
    if (this._isEmptyAddress(owner)) {
      return null
    }

    if (!txHash) {
      // TODO @bshevchenko: _timestamp in LogRegisterTicker event of polymath-core@1.1.0 is not indexed, hence we...
      // TODO @bshevchenko: ...can't filter by it. Fix this when it'll be indexed
      const events = await this._getRegisterTickerEvents()
      for (let event of events) {
        if (event.returnValues._timestamp === timestamp) {
          txHash = event.transactionHash
        }
      }
    }

    timestamp = this._toDate(timestamp)
    let expires
    if (!status) {
      const expiryLimit = await this.expiryLimit() * 1000
      expires = new Date(timestamp.getTime() + expiryLimit)
    }
    return {
      ticker: symbol,
      owner,
      name,
      status,
      expires,
      timestamp,
      txHash,
      ...await IPFS.get(swarmHash)
    }
  }

  async getMyTokens (): Promise<Array<SymbolDetails>> {
    const events = await this._getRegisterTickerEvents()
    const tokens = []
    const expiryLimit = await this.expiryLimit() * 1000
    for (let event of events) {
      const v = event.returnValues
      const timestamp = this._toDate(v._timestamp)
      const expires = new Date(timestamp.getTime() + expiryLimit)
      const now = new Date()
      if (now >= expires) {
        continue
      }
      tokens.push({
        ticker: v._symbol,
        owner: v._owner,
        name: v._name,
        expires,
        timestamp: v._timestamp,
        txHash: event.transactionHash,
      })
      const details = await this.getDetails(v._symbol, event.transactionHash)
      if (details) {
        tokens.push(details)
      }
    }
    return tokens
  }

  async registerTicker (details: SymbolDetails): Promise<Web3Receipt> {
    const ipfs: TickerIPFS = { }
    const swarmHash = await IPFS.put(ipfs)
    return await this._tx(
      this._methods.registerTicker(this.account, details.ticker, details.name, swarmHash)
    )
  }
}

export default new TickerRegistry(artifact)
