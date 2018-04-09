// @flow

import artifact from 'polymath-core/build/contracts/CappedSTOFactory.json'

import Contract from './Contract'

// TODO @bshevchenko: this class here is temporarily to have ability to retrieve CappedSTOFactory contract address
class CappedSTOFactory extends Contract {
}

export default new CappedSTOFactory(artifact)
