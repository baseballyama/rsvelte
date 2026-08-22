# A `let:` directive whose value is not a destructurable pattern crashes the official compiler

Found while measuring #3261. It is not an rsvelte divergence — rsvelte compiles
the input — but the official compiler throws a bare `TypeError` instead of a
Svelte diagnostic, so the affected cells have no verdict to compare against and
are excluded from `crates/rsvelte_core/tests/data/template_expression_ts_gate.json`.

## Reproduction

```svelte
<Comp let:v={f()}>x</Comp>
```

svelte 5.56.9:

```
TypeError: Cannot read properties of undefined (reading 'map')
```

The thrown value has no `code` and no `start`, so it is not a `CompileError` and
nothing downstream can report a position for it.

## What actually varies

A `let:` value is a destructuring **pattern**, and the crash is exactly "the
value parsed, but it is not a pattern". Measured:

| `let:v={…}` | official |
|---|---|
| `y` | compiles |
| `[y]` | compiles |
| `f()` | **TypeError** |
| `y + 1` | **TypeError** |
| `(a => a)("")` | **TypeError** |

**`lang="ts"` is not part of it.** Every row above was measured with and without
a `<script lang="ts">` and the verdict is the same in both. That is worth stating
because the first version of this note claimed a TypeScript-typed arrow was the
trigger — it is not, and the untyped `(a => a)("")` crashes identically. The
defect surfaced during a TypeScript-mode investigation only because in a
JavaScript component the TypeScript syntax raises `js_parse_error` first and the
crash is never reached.

## Status

Not reported upstream yet. rsvelte accepts these inputs; since upstream produces
no diagnostic to match, no rsvelte change is proposed here.
