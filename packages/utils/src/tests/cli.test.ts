/** biome-ignore-all lint/suspicious/noConsole: <The printed output is what these tests check> */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockLoadConfig } = vi.hoisted(() => ({ mockLoadConfig: vi.fn() }));

vi.mock('../config', () => ({
  CONFIG_FILE_NAME: 'lunchbox.config.json',
  loadConfig: mockLoadConfig,
}));

import { runCli } from '../cli';
import type { CliOptions } from '../cli';

interface ToolConfig {
  name: string;
}

const run = vi.fn<CliOptions<ToolConfig>['run']>();
const options: CliOptions<ToolConfig> = {
  description: 'does things',
  name: 'lunchbox-tool',
  run,
  section: 'tool',
  validators: { name: () => true },
  version: '1.2.3',
};

describe('runCli', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockLoadConfig.mockReturnValue({ ok: true, value: { name: 'a' } });
  });

  afterEach(() => {
    process.exitCode = undefined;
  });

  it('starts the tool with the loaded config', async () => {
    await runCli(options, []);

    expect(run).toHaveBeenCalledWith({ name: 'a' });
    expect(process.exitCode).toBeUndefined();
  });

  it.each(['--help', '-h'])('prints the help with %s without starting the tool', async (flag) => {
    await runCli(options, [flag]);

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Usage: lunchbox-tool [options]'));
    expect(run).not.toHaveBeenCalled();
  });

  it.each(['--version', '-v'])('prints the version with %s without starting the tool', async (flag) => {
    await runCli(options, [flag]);

    expect(console.log).toHaveBeenCalledWith('1.2.3');
    expect(run).not.toHaveBeenCalled();
  });

  it.each([['--unknown'], ['positional']])('fails on the unexpected argument %s', async (arg) => {
    await runCli(options, [arg]);

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Run "lunchbox-tool --help" for usage.'));
    expect(process.exitCode).toBe(1);
    expect(run).not.toHaveBeenCalled();
  });

  it('fails on an invalid config without starting the tool', async () => {
    mockLoadConfig.mockReturnValue({ error: 'Invalid config', ok: false });

    await runCli(options, []);

    expect(console.error).toHaveBeenCalledWith('Invalid config');
    expect(process.exitCode).toBe(1);
    expect(run).not.toHaveBeenCalled();
  });
});
