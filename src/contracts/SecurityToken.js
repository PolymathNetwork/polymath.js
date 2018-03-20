import artifact from 'polymath-core_v2/build/contracts/SecurityToken.json'
import BigNumber from 'bignumber.js'

import Contract from './Contract'

export default class SecurityToken extends Contract {
  constructor (at: string) {
    super(artifact, at)
  }

  async addDecimals (n): Promise<BigNumber> {
    return new BigNumber(10).toPower(
      await this.decimals()
    ).times(n)
  }

  async removeDecimals (n): Promise<BigNumber> {
    return new BigNumber(n).div(new BigNumber(10).toPower(
      await this.decimals()
    ))
  }

  async transfer (to: string, amount: BigNumber) {
    return this._tx(this._methods.transfer(to, this.addDecimals(amount)))
  }

  async transferFrom (from: string, to: string, amount: BigNumber) {
    return this._tx(this._methods.transferFrom(from, to, this.addDecimals(amount)))
  }
}
