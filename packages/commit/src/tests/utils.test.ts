import { describe, expect, it, vi } from 'vitest';

const { mockCancel } = vi.hoisted(() => ({ mockCancel: vi.fn() }));

vi.mock('@clack/prompts', () => ({
  cancel: mockCancel,
  isCancel: (value: unknown) => value === Symbol.for('cancel'),
  text: vi.fn(),
}));

import { unwrap } from '@lunchbox-tools/utils';

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
