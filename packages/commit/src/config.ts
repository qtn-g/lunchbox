import { isBoolean, isOptionList, isPositiveInteger, ticketValidators } from '@lunchbox-tools/utils';
import type { ConfigValidators } from '@lunchbox-tools/utils';
import type { CommitConfig } from './type';

export const configValidators: ConfigValidators<CommitConfig> = {
  commitScopes: isOptionList(['label', 'value']),
  commitTypes: isOptionList(['label', 'section', 'value']),
  maximumSubjectLength: isPositiveInteger,
  noVerify: isBoolean,
  ...ticketValidators,
};
