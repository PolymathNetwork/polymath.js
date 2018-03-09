import BigNumber from 'bignumber.js'

import artifact from '../../tmp/PolyToken.json' // TODO @bshevchenko: will be replaced with artifact from polymath-core_v2 npm package
import Contract from './Contract'

class PolyToken extends Contract {
  decimals: number = 18;

  addDecimals (n): BigNumber {
    return new BigNumber(10).toPower(this.decimals).times(n)
  }

  removeDecimals (n): BigNumber {
    return new BigNumber(n).div(new BigNumber(10).toPower(this.decimals))
  }

  async balanceOf (account: string): Promise<BigNumber> {
    return this.removeDecimals(await this._methods.balanceOf(account).call())
  }

  async myBalance (): Promise<BigNumber> {
    return this.balanceOf(this.account)
  }

  async allowance (owner: string, spender: string): Promise<BigNumber> {
    return this.removeDecimals(
      await this._methods.allowance(owner, spender).call(),
    )
  }

  async getTokens (amount: BigNumber) {
    await this._tx(this._methods.getTokens(this.addDecimals(amount)))
  }

  async approve (spender: string, amount: BigNumber) {
    await this._tx(this._methods.approve(spender, this.addDecimals(amount)))
  }
}

export default new PolyToken(artifact)
