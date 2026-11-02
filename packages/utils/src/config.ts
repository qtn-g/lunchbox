import fs from 'node:fs';
import { join } from 'node:path';
import { isTicketProvider } from './ticket';
import { tryRunCommand } from './utils';
import type { TicketSettings } from './ticket';

export const CONFIG_FILE_NAME = 'lunchbox.config.json';

export type ConfigResult<T> = { ok: true; value: T } | { ok: false; error: string };

export type FieldValidator = (value: unknown) => boolean;

/**
 * One validator per configuration option. Options missing from this map are rejected, which catches typos.
 */
export type ConfigValidators<T> = { readonly [K in keyof T]: FieldValidator };

export interface ConfigSource<T> {
  /** Top-level key of the config file holding the options of this tool. */
  readonly section: string;
  readonly validators: ConfigValidators<T>;
}

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isString: FieldValidator = (value: unknown): boolean => typeof value === 'string';

export const isBoolean: FieldValidator = (value: unknown): boolean => typeof value === 'boolean';

export const isPositiveInteger: FieldValidator = (value: unknown): boolean => Number.isInteger(value) && Number(value) > 0;

/**
 * Validates a non-empty list of prompt options, each holding every key of `keys` as a string.
 * An empty list is rejected because the prompts could not offer any choice.
 */
export const isOptionList = (keys: ReadonlyArray<string>): FieldValidator => {
  return (value: unknown): boolean =>
    Array.isArray(value)
    && value.length > 0
    && value.every((option: unknown) => isRecord(option) && keys.every((key) => isString(option[key])));
};

export const ticketValidators: ConfigValidators<TicketSettings> = {
  ticketPrefix: isString,
  ticketProvider: isTicketProvider,
};

const findInvalidOption = <T>(section: Record<string, unknown>, validators: ConfigValidators<T>): string | undefined => {
  const validatorsByOption = new Map<string, FieldValidator>(Object.entries(validators));
  return Object.keys(section).find((option) => !validatorsByOption.get(option)?.(section[option]));
};

const isValidSection = <T>(section: unknown, validators: ConfigValidators<T>): section is Partial<T> => {
  return isRecord(section) && findInvalidOption(section, validators) === undefined;
};

const parseJson = (contents: string): ConfigResult<unknown> => {
  try {
    return { ok: true, value: JSON.parse(contents) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error), ok: false };
  }
};

/**
 * Extracts and validates the options of one tool from the contents of a config file.
 * A missing section is valid and yields an empty config, so the tool uses its defaults.
 */
export const parseConfig = <T>(contents: string, { section, validators }: ConfigSource<T>): ConfigResult<Partial<T>> => {
  const parsed = parseJson(contents);
  if (!parsed.ok) {
    return parsed;
  }
  if (!isRecord(parsed.value)) {
    return { error: 'The config file must contain a JSON object.', ok: false };
  }
  const config = parsed.value[section] ?? {};
  if (!isRecord(config)) {
    return { error: `"${section}" must be an object.`, ok: false };
  }
  if (isValidSection(config, validators)) {
    return { ok: true, value: config };
  }
  return { error: `Unknown or invalid option "${section}.${findInvalidOption(config, validators)}".`, ok: false };
};

const getConfigDirectory = (): string => {
  const result = tryRunCommand('git rev-parse --show-toplevel', { stdio: ['pipe', 'pipe', 'pipe'] });
  return result.ok ? result.value.trim() : process.cwd();
};

const readConfigFile = (path: string): ConfigResult<string> => {
  try {
    return { ok: true, value: fs.readFileSync(path, 'utf8') };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error), ok: false };
  }
};

/**
 * Loads the options of one tool from `lunchbox.config.json` at the root of the current git repository
 * (or the working directory outside of one). A missing file is valid and yields an empty config.
 */
export const loadConfig = <T>(source: ConfigSource<T>): ConfigResult<Partial<T>> => {
  const path = join(getConfigDirectory(), CONFIG_FILE_NAME);
  if (!fs.existsSync(path)) {
    return { ok: true, value: {} };
  }
  const file = readConfigFile(path);
  if (!file.ok) {
    return { error: `Could not read ${path}: ${file.error}`, ok: false };
  }
  const config = parseConfig(file.value, source);
  return config.ok ? config : { error: `Invalid ${path}: ${config.error}`, ok: false };
};
