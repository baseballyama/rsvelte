---
"@rsvelte/compiler": minor
---

Upgrade the Svelte compatibility target to **5.56.1** and reach **100% in-scope
test compatibility (3515/3515)**.

The 5.56.1 bump was entirely DeclarationTag bug-fixes (upstream #18330 / #18348 /
#18350 / #18352 / #18353); all of them are ported:

- loose `{let x = a / }` → empty-name declarator (#18353)
- unterminated declaration tag (`{let x = a /`) now reports `unexpected_eof` (#18350)
- `type`-identifier-vs-type-alias disambiguation + interior-comment attachment,
  so `{type instanceof Foo}` / `{type in foo}` parse as expression tags (#18330)
- multi-declarator parsing + leading-whitespace + client comma-rejoin +
  server cross-tag derived access + division-after-string (#18348 / #18353)
- the `state_referenced_locally` warning for DeclarationTag (#18348)
- async-derived component-prop getter + server `$.async_derived` unthunk (#18352)

Also lands the remaining 5.56.0 async-declaration-tag clusters:

- element-nested `{const}` / `{let}` block-scope wrap + constant-folding of the
  shadowed binding (`declaration-tags`)
- `metadata.promises_id` lowering for `{let x = $state(await …)}` on both client
  and server (`async-declaration-tag`, `async-declaration-tag-2`)
- shorthand `style:x` directive after a top-level `await` no longer over-emits
  `$$promises` blockers (`async-style-after-await`)
