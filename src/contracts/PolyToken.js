import artifact from 'polymath-core_v2/build/contracts/PolyTokenFaucet.json'
import BigNumber from 'bignumber.js'

import Contract from './Contract'

const TRANSFER = 'Transfer'

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
    return this._tx(this._methods.getTokens(this.addDecimals(amount), this.account))
  }

  async transfer (to: string, amount: BigNumber) {
    return this._tx(this._methods.transfer(to, this.addDecimals(amount)))
  }

  async transferFrom (from: string, to: string, amount: BigNumber) {
    return this._tx(this._methods.transferFrom(from, to, this.addDecimals(amount)))
  }

  async approve (spender: string, amount: BigNumber) {
    return this._tx(this._methods.approve(spender, this.addDecimals(amount)))
  }

  async increaseApproval (spender: string, amount: BigNumber) {
    return this._tx(this._methods.increaseApproval(spender, this.addDecimals(amount)))
  }

  async decreaseApproval (spender: string, amount: BigNumber) {
    return this._tx(this._methods.decreaseApproval(spender, this.addDecimals(amount)))
  }

  async subscribeMyTransfers (
    fromCallback: (from: string, value: BigNumber) => void,
    toCallback: (to: string, value: BigNumber) => void,
  ) {
    const callback = (event) => {
      const values = event.returnValues
      const value = new BigNumber(values.value)
      if (values.from === this.account) {
        fromCallback(values.from, value)
      } else {
        toCallback(values.to, value)
      }
    }
    return Promise.all([
      this.subscribe(TRANSFER, { from: this.account }, callback),
      this.subscribe(TRANSFER, { to: this.account }, callback)
    ])
  }
}

export default new PolyToken(artifact)
