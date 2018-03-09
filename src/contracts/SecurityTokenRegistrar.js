import BigNumber from 'bignumber.js'

import artifact from 'polymath-core/build/contracts/SecurityTokenRegistrar.json'  // TODO @bshevchenko: will be replaced with artifact from polymath-core_v2 npm package
import Contract from './Contract'
import PolyToken from './PolyToken'
import { SecurityToken } from './types'

class SecurityTokenRegistrar extends Contract {
  fee: number = new BigNumber(100000);
  namespace: string = 'polymath';

  async isPreAuth (): boolean {
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

  async preAuth () {
    await PolyToken.approve(this.address, this.fee)
  }

  async createSecurityToken (token: SecurityToken) {
    await this._tx(
      this._methods.createSecurityToken(
        this.namespace,
        token.name,
        token.ticker,
        new BigNumber(10).toPower(token.decimals).times(token.totalSupply),
        token.decimals,
        token.owner,
        8,
      ),
    )
    // TODO @bshevchenko: update API
  }
}

export default new SecurityTokenRegistrar(artifact)
