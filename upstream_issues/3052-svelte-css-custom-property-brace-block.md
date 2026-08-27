# Svelte's CSS parser rejects a custom property whose value contains a `{}` block

The official Svelte compiler (v5.56.8) rejects this component with
`css_expected_identifier`:

```svelte
<p>x</p>
<style>
p { --tpl: { color: red; }; }
</style>
```

```
css_expected_identifier — Expected a valid CSS identifier
```

An empty block (`--e: {};`) fails the same way.

Per [css-variables](https://drafts.csswg.org/css-variables/#defining-variables), a custom
property's value grammar is `<declaration-value>`, which admits almost any token stream —
including `{}` blocks, so long as they balance. Browsers accept and expose such values via
`getPropertyValue`, and PostCSS/Prettier both parse them. The Svelte CSS parser instead
resumes ordinary value scanning after the custom-property name and trips on `{` where it
expects an identifier.

rsvelte deliberately does **not** reproduce the rejection. A balanced block is a valid
`<declaration-value>` and rejecting it changes which styles a component can express; this is
not a byte-only difference between semantically equivalent outputs. rsvelte preserves the
block and the declarations after it. `crates/rsvelte_core/tests/css_custom_property_block_3052.rs`
pins balanced curly/square blocks plus string, comment, and escape carriers, while keeping an
ordinary property's `{}` value rejected.

This is therefore a permanent error-presence divergence until upstream accepts the input. A
corpus candidate must be justified as an upstream semantic defect rather than enrolled as an
unexplained failure.

Local anchor: [#3052](https://github.com/baseballyama/rsvelte/issues/3052).

Desired upstream behavior: parse the custom-property value as `<declaration-value>`
(balanced-token scan) instead of the ordinary declaration value grammar, or document the
restriction.
