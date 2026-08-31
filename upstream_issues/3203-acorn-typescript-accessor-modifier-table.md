# `@sveltejs/acorn-typescript` rejects `static accessor` and raises at a column used as an offset

Two independent defects in the same function,
`tsParseModifiers` (`@sveltejs/acorn-typescript@1.0.10`, `index.js:2560-2643`), both reached by
a `lang="ts"` `<script>`.

## 1. `static accessor x` is rejected, and it is valid TypeScript

The auto-accessor branch declares three incompatibilities:

```js
} else if (tsIsClassAccessor(modifier)) {
  ...
  incompatible(startLoc, modifier, 'accessor', 'readonly');
  incompatible(startLoc, modifier, 'accessor', 'static');
  incompatible(startLoc, modifier, 'accessor', 'override');
```

`accessor` + `readonly` and `accessor` + `override` are TypeScript errors (TS1243 / TS1029), but
**`static accessor x` is legal** — `tsc` accepts it, and so does the stage-3 proposal. So

```svelte
<script lang="ts">
	class C {
		static accessor a = 1;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
```

is `js_parse_error: 'accessor' modifier cannot be used with 'static' modifier.`

The check is also order-dependent, which is a second symptom of the same rule being wrong rather
than merely strict: `incompatible` only fires when the *other* modifier has already been seen, so
`accessor static a = 1` — the same member, modifiers transposed — parses, and Svelte then reports
`typescript_invalid_feature` for the accessor field as it does for every other spelling.

## 2. The raise position is a column, used as an absolute offset

```js
const incompatible = (loc, modifier, mod1, mod2) => {
  if (modified[mod1] && modifier === mod2 || modified[mod2] && modifier === mod1) {
    this.raise(loc.column, TypeScriptError.IncompatibleModifiers({ modifiers: [mod1, mod2] }));
```

`enforceOrder` does the same. `raise` takes a **position**; `loc.column` is a column. Every other
raise in the file passes `this.start` or `node.start`.

For the component above, the `accessor` modifier sits at line 3 column 9, so the error is reported
at **offset 9** of the document — inside the `<script lang="ts">` tag, on a line the member is not
on. Svelte reports `3:2` … `1:9` accordingly.

## Where rsvelte stands

rsvelte reports `typescript_invalid_feature` for `static accessor a = 1` (OXC parses the member,
and `remove_typescript_nodes` rejects the accessor field, which is what upstream does for every
other spelling of it). Both compilers refuse the input; only the code and the position differ, and
matching upstream here would mean reproducing a wrong rule at a wrong position. The three affected
axis values are ratcheted on the `class-modifier` matrix family, justified in
`compatibility/KNOWN-FAILURES.md#matrix-known-failures`.
