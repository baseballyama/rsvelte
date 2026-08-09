---
"@rsvelte/compiler": patch
---

Read a regex literal that follows a keyword, so `return /re/` is not scanned as a division

`shared::js_scan::skip_opaque` — the scanner every text pass in the client
instance-script pipeline steps through — decided whether a `/` opened a regex
literal from the **previous byte only**. An identifier-looking byte read as "an
operand ended here, so this is a division", and the `n` of `return` is
identifier-looking. Every reserved word that can precede a regex literal in
expression position was affected the same way: `typeof`, `case`, `in`, `of`,
`delete`, `void`, `instanceof`, `yield`, `await`, `throw`, `new`, `do`, `else`,
`extends`, `default`.

Reading the literal as a division leaves its body exposed as code, so the
delimiters the surrounding passes hunt for — `;`, `}`, `)`, and a `//` inside a
character class — are counted from inside the regex:

```svelte
<script>
  export let v;
  let k;
  $: k = typeof /[//]/.exec(String(v));
</script>
```

before (client): the `//` inside the character class read as a line comment, so
the statement's code ended at `typeof /[` and the `v` behind it was left
unrewritten.

The decision now reads the preceding **token**: if the identifier run ending at
the slash is an ECMA-262 §12.7.2 reserved word that cannot end an expression (the
whole list except `this`, `super`, `true`, `false`, `null`), plus the contextual
`of` of a `for…of` head, the `/` opens a regex. The run must start at a token
boundary and must not be a property name, so `preturn / 2` and `obj.in / 2` stay
divisions, and it must end on the byte the scan actually recorded, so a comment
whose text happens to end in a keyword cannot move the decision. A postfix `++`
or `--` before the slash is now also a division rather than a regex opener.
