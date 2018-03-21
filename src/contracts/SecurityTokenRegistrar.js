import artifact from 'polymath-core_v2/build/contracts/SecurityTokenRegistrar.json'
import BigNumber from 'bignumber.js'

import Contract from './Contract'
import PolyToken from './PolyToken'
import TickerRegistrar from './TickerRegistrar'
import SecurityTokenContract from './SecurityToken'

import type { SecurityToken, SymbolDetails } from './types'

class SecurityTokenRegistrar extends Contract {
  fee = new BigNumber(100) // TODO @bshevchenko: temporarily hardcoded

  async isPreAuth (): Promise<boolean> {
    try {
      const allowance = await PolyToken.allowance(this.account, this.address)
      const currBalance = await PolyToken.myBalance()
      return allowance.gte(this.fee) && currBalance.gte(this.fee)
    } catch (e) {
      // eslint-disable-next-line
      console.log('Pre-auth check failed', e)
      return false
    }
  }

  async getMyToken (): Promise<?SecurityToken> {
    const details = await TickerRegistrar.getDetailsByOwner(this.account)
    return this.getTokenByTicker(details.ticker, details)
  }

  async getTokenByTicker (ticker: string, details: ?SymbolDetails): Promise<?SecurityToken> {
    details = details || await TickerRegistrar.getDetails(ticker)
    if (!details) {
      return null
    }
    let token: SecurityToken = {
      ticker,
      owner: details.owner,
      contact: details.contact,
      isGenerated: false,
      isComplete: false,
    }
    if (details.status) {
      token.isGenerated = true
      token.address = await this.getSecurityTokenAddress(ticker)
      token.contract = new SecurityTokenContract(token.address)
      const [name, decimals, details] = await Promise.all([
        token.contract.name(),
        token.contract.decimals(),
        token.contract.tokenDetails(),
      ])
      token.name = name
      token.decimals = decimals
      token.details = this._toAscii(details)

      const offchain = await this._apiGet(token.address)
      if (offchain !== null) {
        token = {
          ...token,
          ...offchain,
          isComplete: true
        }
      }
    }
    return token
  }

  async preAuth () {
    return await PolyToken.approve(this.address, this.fee)
  }

  async generateSecurityToken (token: SecurityToken) {
    let address = await this.getSecurityTokenAddress(token.ticker)
    if (this._isEmptyAddress(address)) {
      const receipt = await this._tx(
        this._methods.generateSecurityToken(token.name, token.ticker, token.decimals, this._toBytes(token.details))
      )
      address = receipt.events.LogNewSecurityToken.returnValues._securityTokenAddress
    } else {
      if (await this._apiGet(address) !== null) {
        throw new Error('Token is already generated and supplied with off-chain data')
      }
    }
    await this._apiPut(address, token)
    // TODO @bshevchenko: send email
  }
}

export default new SecurityTokenRegistrar(artifact)
