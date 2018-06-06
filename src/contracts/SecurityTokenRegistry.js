// @flow

import artifact from 'polymath-core/build/contracts/SecurityTokenRegistry.json'

import Contract from './Contract'
import TickerRegistry from './TickerRegistry'
import SecurityTokenContract from './SecurityToken'

import type { SecurityToken, Address, Web3Receipt } from '../../types'

const LOG_REGISTER_TICKER = 'LogNewSecurityToken'

class SecurityTokenRegistry extends Contract {

  getSecurityTokenAddress: (ticker: string) => Promise<Address>
  isSecurityToken: (address: Address) => Promise<boolean>
  getSecurityTokenData: (address: Address) => Promise<[string, Address, string]>

  async getTokenByTicker (ticker: string): Promise<?SecurityToken> {
    const details = await TickerRegistry.getDetails(ticker)
    if (!details) {
      return null
    }
    let token: SecurityToken = {
      ...details,
    }
    if (details.status) {
      token.address = await this.getSecurityTokenAddress(ticker)
      const contract = new SecurityTokenContract(token.address)
      token.contract = contract
      token.details = await contract.tokenDetails()

      const granularity = await contract.granularity()
      token.isDivisible = Number(granularity) === 1

      // get token issuing tx hash
      const events = await this._contractWS.getPastEvents(LOG_REGISTER_TICKER, {
        filter: { _securityTokenAddress: token.address },
        fromBlock: 0,
        toBlock: 'latest'
      })
      token.txHash = events[0].transactionHash
      token.timestamp = await this._getBlockDate(events[0].blockNumber)
    }

    return token
  }

  async generateSecurityToken (token: SecurityToken): Promise<?Web3Receipt> {
    return await this._tx(
      this._methods.generateSecurityToken(token.name, token.ticker, token.details || '', token.isDivisible),
      null,
      1.05,
    )
  }
}

export default new SecurityTokenRegistry(artifact)
