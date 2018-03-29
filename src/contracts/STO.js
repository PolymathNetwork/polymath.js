// @flow

import artifact from 'polymath-core_v2/build/contracts/CappedSTO.json' // TODO @bshevchenko: interfaces/ISTO
import BigNumber from 'bignumber.js'

import Contract from './Contract'
import SecurityToken from './SecurityToken'
import { PolyToken } from '../index'
import type { Address, STODetails, STOPurchase, Web3Receipt } from '../../types'

const LOG_TOKEN_PURCHASE = 'TokenPurchase'

export const FUNDRAISE_ETH = 0
export const FUNDRAISE_POLY = 1

export default class STO extends Contract {

  startTime: () => Promise<number>
  endTime: () => Promise<number>
  cap: () => Promise<BigNumber>
  fundsRaised: () => Promise<BigNumber>
  fundraiseType: () => Promise<number>

  token: SecurityToken

  constructor (at: Address, _token: SecurityToken) {
    super(artifact, at)
    this.token = _token
  }

  async getDetails (): Promise<STODetails> {
    const [startTime, endTime, cap, weiRaised] = await Promise.all([
      this.startTime(),
      this.endTime(),
      this.cap(),
      this.fundsRaised()
    ])
    return {
      start: this._toDate(startTime),
      end: this._toDate(endTime),
      cap: this._fromWei(cap),
      raised: this._fromWei(weiRaised),
    }
  }

  async getPurchases (): Promise<Array<STOPurchase>> {
    const result = []
    const events = await this._contractWS.getPastEvents(LOG_TOKEN_PURCHASE, {
      fromBlock: 0,
      toBlock: 'latest'
    })
    for (let event of events) {
      result.push({
        investor: event.returnValues.beneficiary,
        txHash: event.transactionHash,
        amount: await this.token.removeDecimals(event.returnValues.amount),
        paid: this._fromWei(event.returnValues.value)
      })
    }
    return result
  }

  async isPolyFundraise (): Promise<boolean> {
    return await this.fundraiseType() === FUNDRAISE_POLY
  }

  async isPolyPreAuth (value: BigNumber): Promise<boolean> {
    try {
      const allowance = await PolyToken.allowance(this.account, this.address)
      const currBalance = await PolyToken.myBalance()
      return allowance.gte(value) && currBalance.gte(value)
    } catch (e) {
      return false
    }
  }

  async preAuthPoly (value: BigNumber): Promise<Web3Receipt> {
    return PolyToken.approve(this.address, value)
  }

  async buy (beneficiary: Address, value: BigNumber): Promise<Web3Receipt> {
    if (this.isPolyFundraise()) {
      return this._tx(
        this._methods.buyTokensWithPoly(
          beneficiary,
          PolyToken.addDecimals(value)
        ),
      )
    }
    return this._tx(
      this._methods.buyTokens(beneficiary),
      value
    )
  }
}
