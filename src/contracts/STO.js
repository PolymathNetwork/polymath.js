// @flow

import artifact from 'polymath-core/build/contracts/CappedSTO.json' // TODO @bshevchenko: ISTO
import BigNumber from 'bignumber.js'

import Contract from './Contract'
import SecurityToken from './SecurityToken'
import { PolyToken } from '../index'
import type { Address, STODetails, STOPurchase, Web3Receipt } from '../../types'

const LOG_TOKEN_PURCHASE = 'TokenPurchase'

export const FUNDRAISE_ETH = 0
export const FUNDRAISE_POLY = 1

export default class STO extends Contract {

  wallet: () => Promise<Address>
  startTime: () => Promise<BigNumber>
  endTime: () => Promise<BigNumber>
  cap: () => Promise<BigNumber>
  rate: () => Promise<BigNumber>
  fundsRaised: () => Promise<BigNumber>
  investorCount: () => Promise<BigNumber>
  fundraiseType: () => Promise<number>

  token: SecurityToken

  constructor (at: Address, _token: SecurityToken) {
    super(artifact, at)
    this.token = _token
  }

  async tokensSold (): Promise<BigNumber> {
    return this.token.removeDecimals(
      await this._methods.tokensSold().call()
    )
  }

  async isPolyFundraise (): Promise<boolean> {
    return Number(await this.fundraiseType()) === FUNDRAISE_POLY
  }

  async getDetails (): Promise<STODetails> {
    const [startTime, endTime, cap, rate, weiRaised, investorCount, tokensSold, isPolyFundraise] = await Promise.all([
      this.startTime(),
      this.endTime(),
      this.cap(),
      this.rate(),
      this.fundsRaised(),
      this.investorCount(),
      this.tokensSold(),
      this.isPolyFundraise(),
    ])
    return {
      address: this.address,
      start: this._toDate(startTime),
      end: this._toDate(endTime),
      cap: this._fromWei(cap),
      raised: this._fromWei(weiRaised),
      tokensSold: this.token.removeDecimals(tokensSold),
      rate: rate,
      investorCount: investorCount,
      isPolyFundraise,
    }
  }

  async getPurchases (): Promise<Array<STOPurchase>> {
    const result = []
    const events = await this._contractWS.getPastEvents(LOG_TOKEN_PURCHASE, {
      fromBlock: 0,
      toBlock: 'latest'
    })
    const isPolyFundraise = await this.isPolyFundraise()
    for (let event of events) {
      // noinspection JSUnresolvedVariable
      result.push({
        investor: event.returnValues.beneficiary,
        txHash: event.transactionHash,
        amount: await this.token.removeDecimals(event.returnValues.amount),
        paid: isPolyFundraise ?
          this._fromWei(event.returnValues.value) :
          PolyToken.removeDecimals(event.returnValues.value)
      })
    }
    return result
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

  async buy (value: BigNumber): Promise<Web3Receipt> {
    if (this.isPolyFundraise()) {
      return this._tx(
        this._methods.buyTokensWithPoly(
          PolyToken.addDecimals(value)
        ),
      )
    }
    return this._tx(
      this._methods.buyTokens(this.account),
      value
    )
  }
}
