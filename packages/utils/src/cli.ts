/** biome-ignore-all lint/suspicious/noConsole: Used to display info to the user */

import { parseArgs } from 'node:util';
import { CONFIG_FILE_NAME, loadConfig } from './config';
import type { ConfigResult, ConfigSource } from './config';

export interface CliInfo {
  /** Name of the executable, as typed by the user. */
  readonly name: string;
  readonly description: string;
  readonly version: string;
}

export interface CliOptions<T> extends CliInfo, ConfigSource<T> {
  /** Starts the interactive flow of the tool. */
  readonly run: (config: Partial<T>) => Promise<void>;
}

interface CliFlags {
  readonly help?: boolean;
  readonly version?: boolean;
}

const parseFlags = (args: ReadonlyArray<string>): ConfigResult<CliFlags> => {
  try {
    const { values } = parseArgs({
      args: [...args],
      options: {
        help: { short: 'h', type: 'boolean' },
        version: { short: 'v', type: 'boolean' },
      },
    });
    return { ok: true, value: values };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error), ok: false };
  }
};

const formatConfigNote = (section: string): string => {
  return `Options are read from the "${section}" section of ${CONFIG_FILE_NAME}, at the root of the git repository.`;
};

const formatHelp = ({ description, name }: CliInfo, notes: ReadonlyArray<string>): string => {
  return [
    `${name} — ${description}`,
    '',
    `Usage: ${name} [options]`,
    '',
    'Options:',
    '  -h, --help     Show this help',
    '  -v, --version  Show the version',
    ...notes.flatMap((note) => ['', note]),
  ].join('\n');
};

/**
 * Handles `--help`, `--version` and invalid arguments. Returns whether the executable should go on and start.
 * Invalid arguments set a non-zero exit code.
 */
export const handleCliFlags = (
  info: CliInfo,
  { args = process.argv.slice(2), notes = [] }: { args?: ReadonlyArray<string>; notes?: ReadonlyArray<string> } = {}
): boolean => {
  const flags = parseFlags(args);
  if (!flags.ok) {
    console.error(`${flags.error}\nRun "${info.name} --help" for usage.`);
    process.exitCode = 1;
    return false;
  }
  if (flags.value.help) {
    console.log(formatHelp(info, notes));
    return false;
  }
  if (flags.value.version) {
    console.log(info.version);
    return false;
  }
  return true;
};

/**
 * Entry point of an executable: handles the flags, loads the config file and starts the tool.
 * Usage and configuration errors set a non-zero exit code without starting the tool.
 */
export const runCli = async <T>(options: CliOptions<T>, args: ReadonlyArray<string> = process.argv.slice(2)): Promise<void> => {
  if (!handleCliFlags(options, { args, notes: [formatConfigNote(options.section)] })) {
    return;
  }
  const config = loadConfig(options);
  if (!config.ok) {
    console.error(config.error);
    process.exitCode = 1;
    return;
  }
  await options.run(config.value);
};
