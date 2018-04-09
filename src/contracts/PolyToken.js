// @flow

import artifact from 'polymath-core/build/contracts/PolyTokenFaucet.json'
import BigNumber from 'bignumber.js'

import Contract from './Contract'
import type { Address, Web3Event } from '../../types'

const TRANSFER = 'Transfer'

class PolyToken extends Contract {

  decimals: number = 18
  symbol: string = 'POLY'
  name: string = 'Polymath Network'

  allowance: (owner: Address, spender: Address) => Promise<BigNumber>

  addDecimals (n: number | BigNumber): BigNumber {
    return new BigNumber(10).toPower(this.decimals).times(n)
  }

  removeDecimals (n: number | BigNumber): BigNumber {
    return new BigNumber(n).div(new BigNumber(10).toPower(this.decimals))
  }

  async balanceOf (account: Address): Promise<BigNumber> {
    return this.removeDecimals(await this._methods.balanceOf(account).call())
  }

  async myBalance (): Promise<BigNumber> {
    return this.balanceOf(this.account)
  }

  async allowance (owner: Address, spender: Address): Promise<BigNumber> {
    return this.removeDecimals(
      await this._methods.allowance(owner, spender).call(),
    )
  }

  async transfer (to: Address, amount: BigNumber) {
    return this._tx(this._methods.transfer(to, this.addDecimals(amount)))
  }

  async transferFrom (from: Address, to: Address, amount: BigNumber) {
    return this._tx(this._methods.transferFrom(from, to, this.addDecimals(amount)))
  }

  async approve (spender: Address, amount: BigNumber) {
    return this._tx(this._methods.approve(spender, this.addDecimals(amount)))
  }

  async increaseApproval (spender: Address, amount: BigNumber) {
    return this._tx(this._methods.increaseApproval(spender, this.addDecimals(amount)))
  }

  async decreaseApproval (spender: Address, amount: BigNumber) {
    return this._tx(this._methods.decreaseApproval(spender, this.addDecimals(amount)))
  }

  async subscribeMyTransfers (
    fromCallback: (from: Address, value: BigNumber) => void,
    toCallback: (to: Address, value: BigNumber) => void,
  ) {
    const callback = (event: Web3Event) => {
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
