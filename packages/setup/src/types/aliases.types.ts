export interface GitAlias {
  readonly command: string;
  readonly description: string;
  readonly name: string;
}

export interface AliasChanges {
  /** Not set yet, safe to write. */
  readonly added: ReadonlyArray<GitAlias>;
  /** Already set to another value, written only if the user agrees. */
  readonly conflicting: ReadonlyArray<GitAlias>;
}
