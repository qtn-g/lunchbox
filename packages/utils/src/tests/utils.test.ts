import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCancel } = vi.hoisted(() => ({ mockCancel: vi.fn() }));
const { mockExecSync } = vi.hoisted(() => ({ mockExecSync: vi.fn() }));
const { mockBox, mockLogMessage } = vi.hoisted(() => ({ mockBox: vi.fn(), mockLogMessage: vi.fn() }));

vi.mock('@clack/prompts', () => ({
  box: mockBox,
  cancel: mockCancel,
  isCancel: (value: unknown) => value === Symbol.for('cancel'),
  log: { message: mockLogMessage },
}));

vi.mock('node:child_process', () => ({
  execSync: mockExecSync,
}));

import { runCommand, showPreview, tryRunCommand, unwrap } from '../utils';

describe('showPreview', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('displays the content in a box', () => {
    showPreview('content', 'Title');

    expect(mockBox).toHaveBeenCalledWith('content', 'Title');
    expect(mockLogMessage).not.toHaveBeenCalled();
  });

  it('prints the content without the box when the terminal is too narrow', () => {
    mockBox.mockImplementation(() => {
      throw new RangeError('Invalid count value: -8');
    });

    showPreview('content', 'Title');

    expect(mockLogMessage).toHaveBeenCalledWith('Title\ncontent');
  });

  it('rethrows any other error', () => {
    mockBox.mockImplementation(() => {
      throw new Error('unexpected');
    });

    expect(() => showPreview('content', 'Title')).toThrow('unexpected');
  });
});

describe('unwrap', () => {
  it('exits process when value is a cancel symbol', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    unwrap(Symbol.for('cancel'));

    expect(mockCancel).toHaveBeenCalledWith('Operation cancelled.');
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });

  it('returns the value when not cancelled', () => {
    const result = unwrap('some value');

    expect(result).toBe('some value');
  });
});

describe('runCommand', () => {
  it('returns captured stdout when no stdio option is provided', () => {
    mockExecSync.mockReturnValue('  main\n* develop\n');

    const result = runCommand('git branch');

    expect(result).toBe('  main\n* develop\n');
    expect(mockExecSync).toHaveBeenCalledWith('git branch', { encoding: 'utf-8' });
  });

  it('calls execSync with inherited stdio when explicitly passed', () => {
    mockExecSync.mockClear();
    mockExecSync.mockReturnValue('');

    runCommand('git status', { stdio: 'inherit' });

    expect(mockExecSync).toHaveBeenCalledWith('git status', { encoding: 'utf-8', stdio: 'inherit' });
  });

  it('exits process with code 1 on Error', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockExecSync.mockImplementation(() => {
      throw new Error('command not found');
    });

    runCommand('bad-command');

    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});

describe('tryRunCommand', () => {
  it('returns the output on success', () => {
    mockExecSync.mockReturnValue('ok');

    expect(tryRunCommand('git fetch')).toEqual({ ok: true, value: 'ok' });
  });

  it('returns the error instead of exiting on failure', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    mockExecSync.mockImplementation(() => {
      throw new Error('network unreachable');
    });

    expect(tryRunCommand('git fetch')).toEqual({ error: 'network unreachable', ok: false });
    expect(exitSpy).not.toHaveBeenCalled();

    exitSpy.mockRestore();
  });
});
