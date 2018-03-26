// @flow

import artifact from 'polymath-core_v2/build/contracts/SecurityTokenRegistry.json'
import BigNumber from 'bignumber.js'

import Contract from './Contract'
import PolyToken from './PolyToken'
import TickerRegistrar from './TickerRegistry'
import SecurityTokenContract from './SecurityToken'

import type { SecurityToken, SymbolDetails, Address, Web3Receipt } from '../../types'

const LOG_NEW_SECURITY_TOKEN = 'LogNewSecurityToken'

class SecurityTokenRegistry extends Contract {

  getSecurityTokenAddress: (ticker: string) => Promise<Address>

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
    if (!details) {
      return null
    }
    return this.getTokenByTicker(details.ticker, details)
  }

  async getTokenByTicker (ticker: string, details?: SymbolDetails): Promise<?SecurityToken> {
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
      const contract = new SecurityTokenContract(token.address)
      token.contract = contract
      const [name, decimals, details] = await Promise.all([
        contract.name(),
        contract.decimals(),
        contract.tokenDetails(),
      ])
      token.name = name
      token.decimals = decimals
      token.details = details

      const offchain = token.address ? await this._apiGet(token.address) : null
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

  async preAuth (): Promise<Web3Receipt> {
    return PolyToken.approve(this.address, this.fee)
  }

  async generateSecurityToken (token: SecurityToken): Promise<?Web3Receipt> {
    let address = await this.getSecurityTokenAddress(token.ticker)
    let receipt
    if (this._isEmptyAddress(address)) {
      receipt = await this._tx(
        this._methods.generateSecurityToken(
          token.name,
          token.ticker,
          token.decimals,
          this._toBytes(token.details || '')
        )
      )
      address = receipt.events[LOG_NEW_SECURITY_TOKEN].returnValues._securityTokenAddress
    } else {
      if (!address || await this._apiGet(address) !== null) {
        throw new Error('Token is already generated and supplied with off-chain data')
      }
    }
    await this._apiPut(address, token)

    // TODO @bshevchenko: send email

    return receipt
  }
}

export default new SecurityTokenRegistry(artifact)
