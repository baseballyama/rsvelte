# `Property` prints a `FunctionExpression` value as a concise method, changing what the code does

esrap's TS printer emits **every** object property whose value is a `FunctionExpression`
as a concise method, without consulting `node.method`. A concise method is not a function
expression: it has no `[[Construct]]`, and a *named* function expression's own name
binding disappears with it. So the printed program parses and runs, and computes
something different.

Fixed upstream in **esrap 2.3.1**. `sveltejs/svelte`'s `pnpm-lock.yaml` still resolves
`esrap@2.2.12`, so the compiler built from the source tree still has it while the
published npm build does not — the two disagree on the same `VERSION`.

## Reproduction

```svelte
<!-- Probe.svelte -->
<script>
	const math = {
		fact: function fact(n) {
			return n <= 1 ? 1 : n * fact(n - 1);
		}
	};
</script>

<p>{math.fact(5)}</p>
```

`compile(src, { filename: 'Probe.svelte', css: 'external', generate: 'server' })`:

**`submodules/svelte/packages/svelte/src/compiler/index.js` — `VERSION` 5.56.10, esrap 2.2.12**

```js
import * as $ from 'svelte/internal/server';

export default function Probe($$renderer) {
	const math = {
		fact(n) {
			return n <= 1 ? 1 : n * fact(n - 1);
		}
	};

	$$renderer.push(`<p>${$.escape(math.fact(5))}</p>`);
}
```

**`svelte/compiler` from npm — `VERSION` 5.56.10, esrap ≥ 2.3.1**

```js
import * as $ from 'svelte/internal/server';

export default function Probe($$renderer) {
	const math = {
		fact: function fact(n) {
			return n <= 1 ? 1 : n * fact(n - 1);
		}
	};

	$$renderer.push(`<p>${$.escape(math.fact(5))}</p>`);
}
```

Rendering the first one throws:

```
ReferenceError: fact is not defined
```

## Two independent consequences, measured in plain node

```js
const a = { f: function () { this.x = 1; } };   // what the source says
const b = { f() { this.x = 1; } };              // what 2.2.12 prints
new a.f();  // ok
new b.f();  // TypeError: b.f is not a constructor

const c = { fact: function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); } };
const d = { fact(n) { return n <= 1 ? 1 : n * fact(n - 1); } };
c.fact(5);  // 120
d.fact(5);  // ReferenceError: fact is not defined
```

The `new` case matters more than the recursion case, because it does **not** need the
function expression to be named: every `f: function () {…}` in a component loses its
constructibility.

## The axis (source tree, `generate: 'server'`)

| property value | printed as | changed? |
|---|---|---|
| `fact: function fact(n) {…}` (self-recursive) | `fact(n) {…}` | **yes** — `fact` unbound, `new` throws |
| `f: function g() {…}` (name unused) | `f() {…}` | **yes** — `new` throws |
| `f: function () {…}` | `f() {…}` | **yes** — `new` throws |
| `f: function* g() {…}` | `*f() {…}` | **yes** |
| `f: async function g() {…}` | `async f() {…}` | **yes** |
| `f: () => 1` | `f: () => 1` | no — arrows are not `FunctionExpression` |
| `get f() {…}` | `get f() {…}` | no — already a method |
| `f() {…}` | `f() {…}` | no — already a method |
| `[k]: function g() {…}` | `[k]() {…}` | **yes** |

## Why

`esrap/src/languages/ts/index.js`, `Property`, in **2.2.12**:

```js
// shorthand methods
if (node.value.type === 'FunctionExpression') {
```

and in **2.3.1**:

```js
// concise methods, getters and setters
if (
	node.value.type === 'FunctionExpression' &&
	(node.method || node.kind === 'get' || node.kind === 'set')
) {
```

`node.method` is the ESTree flag that records whether the source wrote a concise method.
2.2.12 never reads it, so the round trip is not identity: `{ f: function () {} }` and
`{ f() {} }` both print as `{ f() {} }`.

Version boundary, measured by unpacking each tarball and grepping
`package/src/languages/ts/index.js` for `node.method` (control: `Property(node, context)`
occurs 3 times in every version, so the path and the grep are live):

| esrap | `node.method` present |
|---|---|
| 2.2.12 | no |
| 2.2.13 | no |
| 2.3.0 | no |
| **2.3.1** | **yes** |
| 2.3.6 | yes |

`packages/svelte/package.json` declares `"esrap": "^2.2.12"`, which admits 2.3.6; only the
lockfile holds it back. `pnpm update esrap` in `sveltejs/svelte` is the whole fix.

## Note for rsvelte

rsvelte reproduces this **deliberately**: byte equality with the compiler the gates run is
the goal, and the gates run the source tree (`OFFICIAL_COMPILER_REL`), not the npm build.
The `auto_method` lowering exists in three ports for that reason. When `sveltejs/svelte`
bumps esrap, all three have to be reverted together, and this file is the record of why
they were written.

This is also the sharpest instance of the oracle hazard AGENTS.md records: `VERSION` is
`5.56.10` on both sides and they print different programs.
