# @lunchbox-tools/utils

Shared internal utilities used across `@lunchbox-tools/*` packages. This package is **private** and not published to npm.

## Exports

### `unwrap<T>(value: T | symbol): T`

Safely unwraps a value returned by `@clack/prompts`. If the user cancelled the prompt (i.e. the value is a `symbol` from `isCancel`), it prints a cancellation message and exits the process.

```ts
import { unwrap } from '@lunchbox-tools/utils';

const answer = await text({ message: 'Enter name:' });
const name = unwrap(answer); // exits if cancelled, otherwise returns string
```

### `runCommand(command: string, opts?): string`

Executes a shell command synchronously and returns its stdout as a string. On failure, logs the error and exits the process.

```ts
import { runCommand } from '@lunchbox-tools/utils';

const branches = runCommand('git branch');
```

## License

ISC
