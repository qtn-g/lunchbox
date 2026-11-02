---
name: coding-style
description: The user's personal coding style. Load before writing, refactoring, or reviewing code in any language or project.
---

# Coding style

Understand the existing architecture and conventions before changing code. Make the smallest change that solves the problem and preserve unrelated behavior.

## Project configuration

Before editing, read the project's compiler, linter and formatter configuration (`tsconfig.json`, `biome.json`, `eslint.config.*`, and their equivalents) and write code that passes them: the language target and available APIs, module resolution, strict flags, formatting, import order, and naming rules. These files win over this document where they conflict.

New files follow this document even where older code is organised differently. Existing files keep their layout unless the task is to change it.

## No magic numbers

Always use named `const` values for literal numbers that carry domain meaning. A bare `100` or `60` tells the reader nothing; `SCORE.nameExactMatch` or `MAX_RETRY_COUNT` communicates intent and makes future adjustments localized.

## No magic strings

Always use named `const` values for literal strings that carry domain meaning. A bare `"project"` or `"user"` tells the reader nothing; `SCOPE.project` or `LOCKFILE_PATH` communicates intent. This applies to status codes, environment variable names, file paths, and any string used in more than one place.

## Constants files

- A module's fixed values live in a `<name>.constants.ts` file next to it (`button.tsx` → `button.constants.ts`), so the module stays short and other code and tests import the values without loading the module. Values several modules share live in one shared constants file at the root of the source tree (`src/shared.constants.ts`).
- Name each constant after its module so it can be re-exported without a clash (`BUTTON_EVENT`, not `EVENT`). A lookup is a singular `as const` object keyed by what it names (`BUTTON_ATTRIBUTE.busyLabel`); a list is a plural array (`BUTTON_VARIANTS`) with its derived type beside it.
- Code that crosses a boundary the compiler cannot check (a selector, an attribute name, a storage key) imports the constant instead of repeating the literal. A literal the compiler already checks against a typed API can stay.
- CSS class names are the exception: they stay plain strings where they are used (`class="label"`, `ref('.label')`, `classList.add('fading')`), never `<NAME>_CLASS` constants. The `.css` file that styles them repeats them as literals anyway, so a constant only hides the name from someone reading the template next to its styles.

## Structure

- Keep responsibilities separated: domain rules should not perform I/O, and orchestration should not contain low-level implementation details.
- Prefer small functions with one clear responsibility and descriptive names.
- Keep pure logic deterministic and move filesystem, network, time, environment, and process effects to explicit boundaries. A function with side effects says so in its name (`save*`, `send*`, `update*`).
- Make initialization explicit by calling a function (`registerHandlers()`) rather than relying on a side-effect import (`import './registerHandlers'`).
- Prefer simple composition over premature abstractions. Introduce an abstraction when it removes a real dependency or clarifies a stable boundary.

## Control flow

- Use guard clauses and early returns for invalid input, errors, and exceptional cases.
- Use `if` only as a guard clause that returns early, or throws where the `Result` rule under Function shape allows it. For any other branching, use a simple ternary, an exhaustive mapper, or a named predicate or function.
- Prefer exhaustive mappers over `switch` statements for type- or case-based logic. Use a typed map such as `const labels: Record<MyType, string> = { ... }`; adding a member to `MyType` then produces a compile-time error until the mapper is updated.
- Never use nested ternaries. If the logic needs more branching than a simple ternary or an early return, the function is doing too much: split it into smaller functions with clear responsibilities.
- Prefer array methods (`map`, `filter`, `reduce`, `find`, `flatMap`) over imperative loops. Use a `for` loop only when profiling demands it.
- Run independent async work in parallel with `Promise.all` rather than `await` inside a loop. Keep sequential awaits for steps that depend on the previous one.
- Avoid deeply nested loops and callbacks; extract the inner operation when it needs its own explanation.

## Function shape

- Prefer `const` over `let`. If a value would need to be assigned across a `try` block or multiple branches, extract that work into a named function that returns a `Result` or an explicit value.
- Prefer immutable data: mark object properties and array parameters `readonly`, and return a new value rather than mutating an argument.
- Take at most 2 parameters, then group them in a named options object.
- Split a function rather than giving it a boolean parameter (`fetchActiveUsers()` and `fetchAllUsers()`, not `fetchUsers(includeInactive)`): the flag means it does two things.
- Return a `Result` (`{ ok: true; value: T } | { ok: false; error: E }`) for expected failures, so callers have to handle them. Throw only for programmer errors and unrecoverable states. Every `catch` block handles the error, returns it, or rethrows it.
- Make functions that modify state idempotent: calling them again with the same arguments leaves the same result.
- Keep orchestration functions short and phase-oriented. Extract setup, validation, execution, rollback, cleanup, and rendering into separate helpers when they have distinct responsibilities.
- Keep effectful boundaries explicit. A filesystem or network helper should perform one operation and return a structured result; callers should coordinate those results rather than mixing low-level effects with business rules.
- Avoid mutable state used only to carry context between branches, such as a `currentPath` variable for error reporting. Pass the context into a helper or return it with the operation result.
- Prefer named predicates and helpers over inline conditionals when they make a failure path or invariant easier to understand. Name them positively (`isValid`, not `isNotInvalid`).

## Type safety (TypeScript)

- Never use `any`. Use `unknown` only at system boundaries (parsed JSON, network, environment, `catch`), and narrow it with a type guard or validator before use.
- Narrow or validate instead of casting with `as Foo`. `as const` and `satisfies` are fine, since they narrow literals without overriding the checker.
- Type every function parameter and return value explicitly, including the `Promise<T>` of an `async` function.
- Model mutually exclusive states as a discriminated union, not as optional fields that can contradict each other. This also feeds the exhaustive mappers above.
- Use `interface` for object shapes and `type` for unions, intersections, and aliases of primitives.
- Use string literal unions (`type Status = 'active' | 'inactive'`) rather than `enum`, which generates runtime code and has surprising structural typing.
- Use `undefined` for absent values, not `null`, unless an external contract requires `null`.

## Types directory (TypeScript)

- Code files hold only code. Declare every `interface` and `type` in a `types/` directory, in a file named after its code file (`form.service.ts` → `form.service.types.ts`): the module's own when the code is organised by module (`src/modules/forms/types/`, `frontend/src/forms/types/`), else the one at the root of its source tree (`src/types/`, `tests/types/`). A `types/` directory is flat: it never repeats the code's folders. Types no single code file owns (a gateway's interface, records several files share) take their subject's name (`form.gateway.types.ts`, `catalog.types.ts`).
- A file left with only types moves whole into `types/`, and the empty code file is deleted (gateways, definitions).
- Name every file in `types/` with the `.types.ts` suffix (`session.types.ts`), and import it with that suffix.
- Keep Zod schemas in the code file, and the types derived from them (`z.infer`, `z.input`) beside the schema. The same goes for a type derived from a runtime value, such as `(typeof ROLES)[number]`: the value is its source of truth.

## Verification

- Preserve the existing public contract unless a breaking change is intentional.
- Add or update tests around behavior and failure paths.
- Verify in order, narrowest first: the tests closest to the change, then the wider test suite, then workspace-wide type checking and linting, then the Sonar analysis when the project has one. Fix any new Sonar issue on the changed code, and don't silence one without a stated reason. Run formatting before finishing.
- Keep comments focused on why a non-obvious decision exists, not on repeating what the code says.

## Applying these rules in other languages

The examples above are TypeScript. Apply the intent using the target language's idioms:

- **Exhaustive mappers** — where the type system can't enforce exhaustiveness (e.g. Go), use a `map[Kind]T` plus a test that asserts every known value has an entry, or an exhaustiveness linter such as `exhaustive`.
- **`const` over `let`** — in languages without that distinction, assign each variable once; extract a function instead of reassigning across branches.
- **`Result` values** — use the language's native error convention (e.g. Go's `(T, error)`), not a custom `Result` type.
- **Named constants** — follow the language's naming style (`maxRetryCount` in Go, `MAX_RETRY_COUNT` in TypeScript/Python).
- **Options objects** — use keyword arguments where the language has them (Python), or a struct (Go).
