# rsvelte-lint demo

A single `Demo.svelte` that trips every default-on native rule, plus a
`rsvelte-lint.json` that switches on the opt-in rules.

## Try it

From the repo root:

```bash
# Recommended preset (default-on rules)
cargo run -p rsvelte_lint -- crates/rsvelte_lint/demo/Demo.svelte
```

```
WARNING …/Demo.svelte:8:3 (svelte): `{@html}` can lead to XSS attack.
WARNING …/Demo.svelte:11:0 (svelte): Each block should have a key
ERROR   …/Demo.svelte:16:21 (svelte): This branch can never execute. Its condition is a duplicate …
ERROR   …/Demo.svelte:19:3 (svelte): Unexpected object in text mustache interpolation.
WARNING …/Demo.svelte:22:0 (svelte): Unexpected `{@debug}`.

rsvelte-lint found 2 errors and 3 warnings in 1 file
```

```bash
# With the opt-in rules enabled (adds button-has-type, no-restricted-html-elements)
cargo run -p rsvelte_lint -- --config crates/rsvelte_lint/demo/rsvelte-lint.json \
    crates/rsvelte_lint/demo/Demo.svelte
```

…also reports `Missing an explicit type attribute for button.` on line 25.

## Autofix

`{@debug}` is autofixable. This **rewrites the file in place**, so copy it first:

```bash
cp crates/rsvelte_lint/demo/Demo.svelte /tmp/Demo.svelte
cargo run -p rsvelte_lint -- --fix /tmp/Demo.svelte   # removes the {@debug} tag
```

## Other formats

```bash
cargo run -p rsvelte_lint -- --format sarif crates/rsvelte_lint/demo/Demo.svelte
cargo run -p rsvelte_lint -- --format github-actions crates/rsvelte_lint/demo/Demo.svelte
cargo run -p rsvelte_lint -- --list-rules
```
