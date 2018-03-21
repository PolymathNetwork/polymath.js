import 'babel-polyfill'

export { default as PolyToken } from './contracts/PolyToken'
export { default as SecurityTokenRegistrar } from './contracts/SecurityTokenRegistrar'
export { default as TickerRegistrar } from './contracts/TickerRegistrar'
export { default as CappedSTOFactory } from './contracts/CappedSTOFactory'

export type {
  NetworkParams,
  SymbolDetails,
  SecurityToken,
  STODetails,
  STOPurchase,
  Investor
} from './contracts/types'

export default from './contracts/Contract'
