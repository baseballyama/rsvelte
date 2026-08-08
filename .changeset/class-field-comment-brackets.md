---
"@rsvelte/compiler": patch
---

Stop a delimiter inside a comment from ending a class field early (server).

The server class-member scan accumulates a multi-line field until its brackets
balance, and counted every `(`/`)`/`{`/`}`/`[`/`]` byte — including the ones
inside comments and strings. A `// )` line inside a `$derived.by(…)`,
`$state(…)` or plain multi-line initializer therefore closed the field one line
early, and the leftover `);` was emitted as a class member of its own:

```js
	get snippetProps() { … }
	);
}
```

which does not parse. The six depth counters in that scan now run over code
bytes only, and over the whole accumulated text rather than one line at a time,
so a block comment that spans lines is closed by the same scan that opened it.
