/** biome-ignore-all lint/suspicious/noConsole: Used to display info to the user */

import { parseArgs } from 'node:util';
import { CONFIG_FILE_NAME, loadConfig } from './config';
import type { ConfigResult, ConfigSource } from './config';

export interface CliOptions<T> extends ConfigSource<T> {
  /** Name of the executable, as typed by the user. */
  readonly name: string;
  readonly description: string;
  readonly version: string;
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

const formatHelp = <T>({ description, name, section }: CliOptions<T>): string => {
  return [
    `${name} — ${description}`,
    '',
    `Usage: ${name} [options]`,
    '',
    'Options:',
    '  -h, --help     Show this help',
    '  -v, --version  Show the version',
    '',
    `Options are read from the "${section}" section of ${CONFIG_FILE_NAME}, at the root of the git repository.`,
  ].join('\n');
};

/**
 * Entry point of an executable: handles the flags, loads the config file and starts the tool.
 * Usage and configuration errors set a non-zero exit code without starting the tool.
 */
export const runCli = async <T>(options: CliOptions<T>, args: ReadonlyArray<string> = process.argv.slice(2)): Promise<void> => {
  const flags = parseFlags(args);
  if (!flags.ok) {
    console.error(`${flags.error}\nRun "${options.name} --help" for usage.`);
    process.exitCode = 1;
    return;
  }
  if (flags.value.help) {
    console.log(formatHelp(options));
    return;
  }
  if (flags.value.version) {
    console.log(options.version);
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
