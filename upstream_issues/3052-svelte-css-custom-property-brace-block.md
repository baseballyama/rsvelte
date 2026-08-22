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

rsvelte deliberately reproduces the rejection byte-for-byte — both compilers throw
`css_expected_identifier` on the inputs above, so error parity holds and no corpus ratchet
entry is needed. The adversarial CSS candidate exercising this shape is held out of
`compatibility/pattern-corpus/adversarial/css/` until upstream decides the intended
behavior; if upstream starts accepting the block, rsvelte must follow in the same release.

Local anchor: [#3052](https://github.com/baseballyama/rsvelte/issues/3052).

Desired upstream behavior: parse the custom-property value as `<declaration-value>`
(balanced-token scan) instead of the ordinary declaration value grammar, or document the
restriction.
