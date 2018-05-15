// @flow

import artifact from 'polymath-core/build/contracts/SecurityTokenRegistry.json'

import Contract from './Contract'
import TickerRegistry from './TickerRegistry'
import SecurityTokenContract from './SecurityToken'

import type { SecurityToken, Address, Web3Receipt } from '../../types'

class SecurityTokenRegistry extends Contract {

  getSecurityTokenAddress: (ticker: string) => Promise<Address>

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
      token.decimals = await contract.decimals()
      token.details = await contract.tokenDetails()
    }
    return token
  }

  async generateSecurityToken (
    name: string,
    symbol: string,
    decimals: number = 18,
    tokenDetails: string = ''
  ): Promise<?Web3Receipt> {
    return await this._tx(
      this._methods.generateSecurityToken(name, symbol, decimals, this._toBytes(tokenDetails)),
      null,
      1.05,
    )
  }
}

export default new SecurityTokenRegistry(artifact)
