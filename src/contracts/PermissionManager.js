// @flow

import artifact from 'polymath-core_v2/build/contracts/GeneralPermissionManager.json' // TODO @bshevchenko: interfaces/IPermissionManager

import Contract from './Contract'
import type { Address } from '../../types'

export default class PermissionManager extends Contract {

  constructor (at: Address) {
    super(artifact, at)
  }
}
