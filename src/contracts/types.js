import Web3 from 'web3'

import SecurityTokenContract from './SecurityToken'

export type NetworkParams = {
  id: number,
  web3: Web3,
  web3WS: Web3 | undefined,
  account: string,
  txHashCallback: (hash: string) => void,
  txEndCallback: (receipt: Object) => void,
}

export type SymbolDetails = {
  owner: string,
  timestamp: Date,
  contact: string,
  status: boolean,
}

export type SecurityToken = {
  ticker: string,
  owner: string,
  contact: string,
  address: string,
  name: string,
  decimals: number,
  details: string,
  contract: SecurityTokenContract,

  // off-chain
  url: string,
  firstName: string,
  lastName: string,
  desc: string,

  // flags
  isGenerated: boolean,
  isComplete: boolean,
}
