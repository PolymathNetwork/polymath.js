// @flow

import BigNumber from 'bignumber.js'

import SecurityTokenContract from './src/contracts/SecurityToken'

/**
 * CORE TYPES
 */

export type Web3 = {
  eth: {
    clearSubscriptions: Function,
    abi: {
      encodeFunctionCall: Function
    },
    Contract: Function
  },
  utils: {
    toWei: Function,
    fromWei: Function,
    asciiToHex: Function,
    hexToAscii: Function
  }
}

export type Web3Event = {
  returnValues: Object,
  event: string, // event name
  blockNumber: number,
  transactionHash: string,
}

export type Web3Contract = {
  events: Object,
  getPastEvents: (event: string, {
    filter?: Object,
    fromBlock?: number | string,
    toBlock?: number | string,
  }) => Promise<Array<Web3Event>>,
}

export type Web3Receipt = {
  transactionHash: string,
  blockNumber: number,
  contractAddress: Address,
  gasUsed: number,
  events: { [key: string]: Web3Event },
}

export type Address = string

export type NetworkParams = {
  id: number,
  web3: Web3,
  web3WS: Web3,
  account: Address,
  txHashCallback: (hash: string) => void,
  txEndCallback: (receipt: Object) => void,
}

export type Artifact = {
  abi: Object,
  networks: Object,
}


/**
 * POLYMATH TYPES
 */

export type SymbolDetails = {
  ticker: string,
  owner: Address,
  timestamp: Date,
  contact: string,
  status: boolean,
  expires: ?Date,
}

export type SecurityToken = {
  ticker: string,
  owner: Address,
  contact: string,
  address?: Address,
  name?: string,
  decimals?: number,
  details?: string,
  contract?: SecurityTokenContract,

  // off-chain
  url?: string,
  firstName?: string,
  lastName?: string,
  desc?: string,

  // flags
  isGenerated: boolean,
  isComplete: boolean,
}

export type STOFactory = {
  title: string,
  name: string,
  usedBy: Array<string>,
  desc: string,
  isVerified: boolean,
  securityAuditBy: string,
  address: Address,
}

export type STODetails = {
  start: Date,
  end: Date,
  cap: BigNumber,
  raised: BigNumber,
}

export type STOPurchase = {
  investor: Address,
  txHash: string,
  amount: BigNumber,
  paid: BigNumber,
}

export type Investor = {
  address: Address,
  addedBy: Address,
  added: Date,
  from: Date,
  to: Date,
}
