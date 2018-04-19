// @flow

import BigNumber from 'bignumber.js'

import SecurityTokenContract from './src/contracts/SecurityToken'

/**
 * CORE TYPES
 */

export type Web3 = {|
  eth: {
    clearSubscriptions: Function,
    abi: {
      encodeFunctionCall: Function
    },
    Contract: Function,
    sign: (dataToSign: any, address: Address) => Promise<string>
  },
  utils: {
    toWei: Function,
    fromWei: Function,
    asciiToHex: Function,
    hexToAscii: Function
  }
|}

export type Web3Event = {|
  returnValues: Object,
  event: string, // event name
  blockNumber: number,
  transactionHash: string,
|}

export type Web3Contract = {|
  events: Object,
  getPastEvents: (event: string, {
    filter?: Object,
    fromBlock?: number | string,
    toBlock?: number | string,
  }) => Promise<Array<Web3Event>>,
|}

export type Web3Receipt = {|
  transactionHash: string,
  blockNumber: number,
  contractAddress: Address,
  gasUsed: number,
  events: { [key: string]: Web3Event },
|}

export type Address = string

export type NetworkParams = {|
  id: number,
  web3: Web3,
  web3WS: Web3,
  account: Address,
  txHashCallback: (hash: string) => void,
  txEndCallback: (receipt: Object) => void,
|}

export type Artifact = {|
  abi: Object,
  networks: Object,
|}


/**
 * POLYMATH TYPES
 */

export type SymbolDetails = {|
  ticker: string,
  name: string,
  timestamp?: Date,
  status?: boolean,
  expires?: ?Date,
  owner?: Address,
  txHash?: string,

  // off-chain
  company: string,
  desc: string,
|}

export type SecurityToken = {|
  ticker: string,
  name: string,
  timestamp: Date,
  status: boolean,
  owner: Address,
  expires: ?Date,
  txHash: string, // ticker registration or token deployment (depends on status)

  address?: Address,
  decimals?: number,
  contract?: SecurityTokenContract,

  // off-chain
  company: string,
  desc: string,
|}

export type STOFactory = {|
  title: string,
  name: string,
  usedBy: Array<string>,
  desc: string,
  isVerified: boolean,
  securityAuditBy: string,
  address: Address,
|}

export type STODetails = {|
  start: Date,
  end: Date,
  cap: BigNumber,
  raised: BigNumber,
  investorCount: number,
  tokensSold: BigNumber,
  isPolyFundraise: boolean,
|}

export type STOPurchase = {|
  investor: Address,
  txHash: string,
  amount: BigNumber,
  paid: BigNumber,
|}

export type Investor = {|
  address: Address,
  from: Date,
  to: Date,
  added?: Date,
  addedBy?: Address,
|}
