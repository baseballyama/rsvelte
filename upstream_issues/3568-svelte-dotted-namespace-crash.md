# Svelte's TS strip crashes on a dotted `namespace N.M { … }` with a raw `TypeError`

The official Svelte compiler (v5.56.9, `submodules/svelte` @ `20b341f10048`) kills `compile()`
with a raw `TypeError` — no error code, no position, no frame — when a script contains a
namespace whose name is dotted:

```svelte
<script lang="ts">
	namespace N.M { type T = 1; }
	let k = 1;
</script>
{k}
```

```
TypeError: node.body.body.map is not a function
```

`e.code` is `undefined` and there is no `start`, so it is not a Svelte diagnostic. The cause is
`phases/1-parse/remove_typescript_nodes.js`:

```js
TSModuleDeclaration(node, context) {
	if (!node.body) return b.empty;

	// namespaces can contain non-type nodes
	const cleaned = /** @type {any[]} */ (node.body.body).map((entry) => context.visit(entry));
	…
}
```

`node.body` is assumed to be a `TSModuleBlock`. For a dotted name it is **another
`TSModuleDeclaration`** (`namespace N.M { … }` parses as `N` whose body is `M`), so
`node.body.body` is that inner declaration's `TSModuleBlock` object and `.map` is not a
function.

Measured on the pinned oracle, every dotted spelling reaching this visitor crashes, whether the
body is type-only or not, in an instance script and in `<script module>` alike:

| source | official |
|---|---|
| `namespace N.M { type T = 1; }` | `TypeError` |
| `namespace N.M { let x = 1; }` | `TypeError` |
| `namespace N.M.O { type T = 1; }` | `TypeError` |
| `namespace N.M { }` | `TypeError` |
| `declare namespace N.M { type T = 1; }` | `TypeError` |
| `export namespace N.M { type T = 1; }` | `TypeError` |
| `export declare namespace N.M { type T = 1; }` | compiles (the `exportKind === 'type'` short-circuit in `ExportNamedDeclaration` returns before the namespace is visited) |

The un-dotted desugaring compiles correctly, which is what makes this a defect rather than a
policy: `namespace N { namespace M { type T = 1; } }` compiles, and
`namespace N { namespace M { let x = 1; } }` raises a proper coded
`typescript_invalid_feature` positioned on the inner `namespace M { … }`. The visitor already
recurses through `context.visit`, so the dotted form only needs its body treated as one more
entry.

**A correction to the record**: [rsvelte#3568](https://github.com/baseballyama/rsvelte/issues/3568)
states that the same `namespace N.M { … }` "passes through `compileModule` on the official side",
offered as evidence that the crash is specific to the instance-script path. That control does not
hold on the pinned oracle. `compileModule` parses with `typescript: false`
(`2-analyze/index.js` → `parse(source, comments, false, false)`), so **every** TypeScript
declaration form — `type`, `interface`, `namespace`, `enum`, `declare const`, dotted or not — is
rejected there with `js_parse_error: Unexpected token`, measured over all 29 declaration forms ×
2 export spellings. The visitor is simply never reached from that entry point, so it says nothing
about whether the crash is path-specific.

## What rsvelte does, and why

rsvelte does **not** reproduce the crash. Reproducing it is not available: the project only
mirrors upstream where the behaviour is the same and the bytes differ, and there is no coded
diagnostic to mirror.

The behaviour rsvelte pins instead is the **desugaring**: `namespace N.M { … }` is treated
exactly as `namespace N { namespace M { … } }`, which is a shape upstream itself handles
correctly. So a dotted namespace with a type-only body is stripped, and a dotted namespace
holding a value raises `typescript_invalid_feature` — the same code the un-dotted spelling gets
from upstream. This is a decision, not a derivation from upstream output; it is pinned by
`crates/rsvelte_core/tests/ts_export_type_only_declaration.rs` so that a later reader does not
"fix" rsvelte towards the crash. Until then rsvelte dropped the dotted body at parse without
looking at it, so it was silently *more* permissive than the desugaring — `namespace N.M { let x
= 1; }` compiled.

Desired upstream behavior: visit a `TSModuleDeclaration` body that is itself a
`TSModuleDeclaration` through `context.visit` like any other entry, so the dotted spelling
behaves as its desugaring already does.
