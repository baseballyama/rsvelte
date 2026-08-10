# oxc_parser accepts U+0085 as JavaScript whitespace

`oxc_parser` accepts U+0085 (NEL) in JavaScript source where Acorn rejects it.

```js
let x= 1;
```

ECMA-262 WhiteSpace is TAB, VT, FF, ZWNBSP, and Unicode `Zs`; NEL is `Cc` and is
neither WhiteSpace nor a LineTerminator. OXC reports it as an irregular whitespace
character without a parse diagnostic, allowing a Svelte `<script>` body that the
upstream Svelte compiler rejects.

rsvelte uses `oxc_parser` for embedded JavaScript, so locally rejecting NEL would
duplicate parser tokenization rules and leave other parser entry points divergent.
The desired upstream behavior is a syntax diagnostic for NEL in token-separating
positions, matching Acorn and ECMA-262.

Reproducer:

```rust
let source = "let x\u{85}= 1;";
let parsed = oxc_parser::Parser::new(&allocator, source, SourceType::mjs()).parse();
assert!(!parsed.diagnostics.is_empty());
```

Tracked in rsvelte issue #2582.
