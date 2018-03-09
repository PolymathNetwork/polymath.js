import Web3 from 'web3'

export type NetworkParams = {
  id: number,
  web3: Web3,
  account: string,
  web3WS: Web3 | undefined,
};

export type SecurityToken = {
  address: string,
  name: string,
  ticker: string,
  totalSupply: number,
  decimals: number,
  owner: string,
  url: string,
  firstName: string,
  lastName: string,
  contact: string,
  desc: string,
};
