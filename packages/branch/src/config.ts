import { isBoolean, isOptionList, ticketValidators } from '@lunchbox-tools/utils';
import type { ConfigValidators } from '@lunchbox-tools/utils';
import type { BranchConfig } from './type';

export const configValidators: ConfigValidators<BranchConfig> = {
  branchTypes: isOptionList(['label', 'value']),
  fetchRemoteBranches: isBoolean,
  ...ticketValidators,
};
