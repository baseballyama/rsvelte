# `svelte/no-add-event-listener`'s suggestion inserts the arguments after the wrong token

The rule's suggestion assumes the token immediately after the callee is the call's
open parenthesis. It never checks that, so whenever some other token sits there
the inserted argument list lands in the wrong place and the suggested edit
corrupts the source.

`packages/eslint-plugin-svelte/src/rules/no-add-event-listener.ts:46-58`:

```ts
const openParen = context.sourceCode.getTokenAfter(callee);
const suggest: SuggestionReportDescriptor[] = [];

if (openParen !== null) {
	suggest.push({
		desc: 'Use `on` from `svelte/events` instead',
		fix(fixer) {
			return [
				fixer.replaceText(callee, 'on'),
				fixer.insertTextAfter(openParen, `${target}, `)
			];
		}
	});
}
```

`getTokenAfter` returns whatever token follows `callee`. The variable is only
*named* `openParen`; the guard tests for `null`, not for `(`.

## Reproduction 1 — an optional call

```svelte
<script>
	let el;

	function go() {
		el?.addEventListener?.('a', () => {});
	}
</script>

<div bind:this={el}></div>
<button onclick={go}>go</button>
```

`callee` is the `MemberExpression` `el?.addEventListener`, and the token after it
is `?.`, so the suggestion produces:

```js
on?.el, ('a', () => {});
```

This is the more damaging of the two, because it **parses**. It is a sequence
expression that evaluates `on?.el`, discards it, evaluates `('a', () => {})`,
discards that, and never registers a listener — so no syntax check anywhere
catches it.

## Reproduction 2 — a comment inside a parenthesised callee

```svelte
<script>
	function go(handlers) {
		(handlers.addEventListener /* alias as any */)('x', () => {});
	}
</script>

<p>{typeof go}</p>
```

Parentheses are not AST nodes, so `callee` is `handlers.addEventListener` and
`getTokenAfter` skips the comment and returns the `)` that closes the
parenthesised expression. The suggestion produces:

```js
(on /* alias as any */)handlers, ('x', () => {});
```

which no JavaScript parser accepts.

## Positive control

The failure is the token, not the rule. Two other calls in the same file get
correct suggestions, and both were verified to be byte-identical to the ones
rsvelte produces:

```js
el[addEventListener]('c', () => {});          // → on(el, 'c', () => {});
new EventTarget().addEventListener('e', …);   // → on(new EventTarget(), 'e', …);
```

Both reproductions were run through ESLint's `Linter.verify` with the pinned
`eslint-plugin-svelte`, applying each suggestion's single range to the source.

## Desired upstream behavior

Offer the suggestion only when the token after the callee really is `(` (or
compute the insertion point from the call's argument list rather than from
`getTokenAfter`). A suggestion is an edit a human applies in their editor, so
producing text that does not parse — or, worse, text that parses and silently
drops the listener registration — is worse than offering nothing.

rsvelte declines the suggestion in both shapes (`find_open_paren` in
`crates/rsvelte_lint/src/rules/no_add_event_listener.rs` returns `None` unless
the next token is `(`), which is the only divergence in
`compatibility/lint-adversarial-suggest-known-failures.md`.
