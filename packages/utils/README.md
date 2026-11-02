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

### `showPreview(content: string, title: string): void`

Displays a preview in a box, or as plain text when the terminal is too narrow to draw one.

### `runCommand(command: string, opts?): string`

Executes a shell command synchronously and returns its stdout as a string. On failure, logs the error and exits the process.

```ts
import { runCommand } from '@lunchbox-tools/utils';

const branches = runCommand('git branch');
```

### `tryRunCommand(command: string, opts?): CommandResult`

Same as `runCommand` but never exits: returns `{ ok: true, value }` or `{ ok: false, error }`. Use it for optional steps such as `git fetch` while offline.

```ts
import { tryRunCommand } from '@lunchbox-tools/utils';

const result = tryRunCommand('git fetch --all --prune');
```

### `runCli(options, args?): Promise<void>`

Entry point of the `lunchbox-*` executables: handles `--help` and `--version`, loads the config file and starts the tool. Usage and configuration errors set a non-zero exit code without starting the tool.

### `loadConfig(source): ConfigResult<Partial<T>>`

Loads and validates one section of `lunchbox.config.json`, at the root of the current git repository. A missing file or section yields an empty config. `parseConfig` does the same from the file contents, and `isString`, `isBoolean`, `isPositiveInteger`, `isOptionList` and `ticketValidators` are the building blocks of a tool's `ConfigValidators`.

### Ticket helpers

Shared ticket logic for the branch and commit prompts, driven by `TicketSettings` (`ticketProvider`, `ticketPrefix`):

| Function | Purpose |
|---|---|
| `isTicketEnabled(provider)` | `false` when the provider is `none` |
| `normalizeTicket(settings, input)` | Canonical ticket (`proj-123` → `PROJ-123`, `#42` → `42`, `123` → `PROJ-123` with `ticketPrefix: 'PROJ-'`) |
| `validateTicket(settings, input)` | `true` or an error message; the ticket is mandatory when a provider is set |
| `formatTicketReference(settings, ticket)` | Commit footer (`Refs: PROJ-123`, `Refs: #42`) |
| `extractTicketFromBranch(settings, branch)` | Ticket found in a `type/TICKET-description` branch name, or `''` |
| `askTicket(settings)` | Prompts for the mandatory ticket; returns `''` without prompting when the provider is `none` |

## License

ISC
