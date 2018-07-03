// @flow

import BigNumber from 'bignumber.js'
import artifact from 'polymath-core/build/contracts/CappedSTOFactory.json'

import Contract from './Contract'
import { PolyToken } from '../'

class CappedSTOFactory extends Contract {

  async setupCost (): Promise<BigNumber> {
    return PolyToken.removeDecimals(await this._methods.setupCost().call())
  }
}

export default new CappedSTOFactory(artifact)
