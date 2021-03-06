// Rewards models
export interface RewardElement {
  denom: string;
  amount: string;
}

export interface Reward {
  validator_address: string;
  reward: RewardElement[];
}

export interface Total {
  denom: string;
  amount: string;
}

export interface RewardResponse {
  rewards: Reward[];
  total: Total[];
}

// Delegation models
export interface Delegation {
  delegator_address: string;
  validator_address: string;
  shares: string;
}

export interface Balance {
  denom: string;
  amount: string;
}

export interface DelegationResponse {
  delegation: Delegation;
  balance: Balance;
}

export interface Pagination {
  next_key?: any;
  total: string;
}

export interface DelegationResult {
  delegation_responses: DelegationResponse[];
  pagination: Pagination;
}

// Transfers models
export interface TransferData {
  name: string;
  height: number;
  msgName: string;
  version: number;
  msgIndex: number;
  uuid: string;
  amount: string;
  txHash: string;
  toAddress: string;
  fromAddress: string;
}

export interface TransactionResult {
  account: string;
  blockHeight: number;
  blockHash: string;
  blockTime: string;
  transactionHash: string;
  success: boolean;
  messageIndex: number;
  messageType: string;
  data: TransferData;
}

export interface TransactionList {
  result: TransactionResult[];
}

// Validator models

export interface Description {
  moniker: string;
  identity: string;
  website: string;
  security_contact: string;
  details: string;
}

export interface CommissionRates {
  rate: string;
  max_rate: string;
  max_change_rate: string;
}

export interface Commission {
  commission_rates: CommissionRates;
  update_time: string;
}

export interface Validator {
  operator_address: string;
  jailed: boolean;
  status: string;
  tokens: string;
  delegator_shares: string;
  description: Description;
  unbonding_height: string;
  unbonding_time: string;
  commission: Commission;
  min_self_delegation: string;
}

export interface ValidatorListResponse {
  validators: Validator[];
}
