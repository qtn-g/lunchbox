---
applyTo: "**/*.ts"
---
# TypeScript Guidelines

## Toolchain Configuration

Before generating or editing any code, read the project's `tsconfig.json` and `biome.json` (or `biome.jsonc`) files at the workspace root and strictly respect every setting they declare.

**`tsconfig.json`** — derive from it:
- Which ECMAScript target and lib to use; do not use APIs unavailable for that target
- Module and module resolution strategy; match import syntax accordingly
- Enabled strict flags (e.g. `noUnusedLocals`, `strictNullChecks`); never produce code that would fail those checks

**`biome.json`** — derive from it:
- All formatter settings (indent style/width, quote style, semicolons, trailing commas, line width, line endings, arrow parens)
- All enabled linter rules; do not write code that would trigger a Biome error or warning
- Import organisation rules (order, `import type` style)
- Naming convention rules

If either file is absent, ignore it.

---

## Single Responsibility

Keep every function, module, and class focused on one concern. If a unit does more than one thing, split it.

## Immutability

Prefer immutable data. Use `const` by default, `readonly` on object properties, and avoid mutating function arguments.

```ts
// bad
function addItem(list: string[], item: string): void {
  list.push(item);
}

// good
function addItem(list: readonly string[], item: string): string[] {
  return [...list, item];
}
```

## Strongly Typed — No `any` / `unknown` Without Narrowing

`any` is forbidden. `unknown` is allowed only at system boundaries (e.g. JSON parsing, external APIs) and must be narrowed immediately before use.

```ts
// bad
function process(data: any) { ... }

// good
function process(data: Record<string, string>) { ... }
```

## No Switch Statements — Use Typed Mapper Functions

Replace `switch`/`case` with a typed record mapper. This is exhaustive, tree-shakeable, and easier to extend.

```ts
// bad
switch (status) {
  case "active": return "Active";
  case "inactive": return "Inactive";
}

// good
const statusLabel: Record<Status, string> = {
  active: "Active",
  inactive: "Inactive",
};
const label = statusLabel[status];
```

## No Magic Numbers or Strings

Every non-obvious literal must be extracted into a named constant.

```ts
// bad
if (retries > 3) { ... }

// good
const MAX_RETRIES = 3;
if (retries > MAX_RETRIES) { ... }
```

## Idempotence

Functions that modify state must be safe to call multiple times with the same arguments. The result should not change after the first application.

## Proper TypeScript Types — No Implicit Returns

All function parameters and return values must be explicitly typed.

```ts
// bad
function greet(name) { return "Hello " + name; }

// good
function greet(name: string): string { return `Hello ${name}`; }
```

## Ternary Over `if` — `if` Only for Early Returns

Use ternary expressions for conditional values. `if` statements are only allowed for early returns (guard clauses).

```ts
// bad
let label;
if (isActive) {
  label = "Active";
} else {
  label = "Inactive";
}

// good
const label = isActive ? "Active" : "Inactive";

// allowed — early return guard
function process(input: string | null): string {
  if (!input) return "";
  return input.trim();
}
```

## Prefer `interface` Over `type`

Use `interface` for object shapes. Reserve `type` for unions, intersections, and aliases of primitives.

```ts
// bad
type User = { id: string; name: string };

// good
interface User { id: string; name: string; }

// type is appropriate here
type Status = "active" | "inactive";
type UserId = string;
```

## Discriminated Unions Over Optional Fields

Model mutually exclusive states with discriminated unions, not optional properties.

```ts
// bad
interface Response { data?: string; error?: string; }

// good
type Response = { ok: true; data: string } | { ok: false; error: string };
```

## No Type Assertions (`as`)

`as` silences the compiler without proving correctness. Use type guards or narrowing instead.

```ts
// bad
const user = data as User;

// good
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "id" in value;
}
```

## Pure Functions by Default

Functions should have no side effects unless the name signals it (`save*`, `send*`, `update*`). A pure function always produces the same output for the same input.

## Max 2 Parameters — Then Use an Options Object

Functions must not exceed 2 parameters. Beyond that, group arguments into a named options interface.

```ts
// bad
function createUser(name: string, email: string, role: string, active: boolean) { ... }

// good
interface CreateUserOptions {
  name: string;
  email: string;
  role: string;
  active: boolean;
}
function createUser(options: CreateUserOptions) { ... }
```

## No Boolean Parameters

A boolean argument is a sign the function does two things. Split it into two functions.

```ts
// bad
function fetchUsers(includeInactive: boolean) { ... }

// good
function fetchActiveUsers() { ... }
function fetchAllUsers() { ... }
```

## Return `Result` Instead of Throwing

Throwing breaks the type system. Use a `Result` union so callers are forced to handle errors.

```ts
type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

function parseConfig(raw: string): Result<Config> {
  try {
    return { ok: true, value: JSON.parse(raw) as Config };
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }
}
```

Never use an empty `catch` block.

## No Side-Effect Imports

`import "./setup"` is hidden control flow. Make initialization explicit by calling a function.

```ts
// bad
import "./registerHandlers";

// good
import { registerHandlers } from "./registerHandlers";
registerHandlers();
```

## Prefer Array Methods Over Imperative Loops

Use `map`, `filter`, `reduce`, `find`, `flatMap` to express intent. Imperative `for` loops are only acceptable when performance profiling demands it.

## Positive Predicate Names

Name boolean variables and functions positively. Avoid double negatives.

```ts
// bad
const isNotInvalid = !validate(input);
if (!isNotInvalid) { ... }

// good
const isValid = validate(input);
if (isValid) { ... }
```

## Prefer Union Literals Over `enum`

TypeScript `enum` generates runtime code and has surprising structural typing behaviour. Use string literal unions instead — they are zero-cost, tree-shakeable, and behave predictably.

```ts
// bad
enum Status { Active = "active", Inactive = "inactive" }

// good
type Status = "active" | "inactive";
```

## Avoid `null` — Prefer `undefined`

Do not mix `null` and `undefined` for absent values. Prefer `undefined`; it is what TypeScript uses internally and requires one fewer check at every call site.

```ts
// bad
function findUser(id: string): User | null { ... }

// good
function findUser(id: string): User | undefined { ... }
```

## Never `await` Inside a Loop

Sequential `await` in a loop serialises work that is usually independent. Use `Promise.all` for parallel execution.

```ts
// bad
for (const id of ids) {
  const user = await fetchUser(id);
}

// good
const users = await Promise.all(ids.map(fetchUser));
```

## Explicit `Promise` Return Types

All `async` functions in public APIs must declare their return type explicitly.

```ts
// bad
async function loadConfig() { ... }

// good
async function loadConfig(): Promise<Config> { ... }
```
