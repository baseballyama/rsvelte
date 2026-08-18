---
"@rsvelte/compiler": patch
---

fix(client): fold a constant with its JS type, not its rendered text

The client constant-folder carried a folded value as `Option<Option<String>>`,
in which `null` and `undefined` are the same value and `0` and `'0'` are the
same value. It now shares the `scope.evaluate` port the server transform
already used, so a fold keeps the operand's type: `$derived(cond ? undefined :
null)` stays reactive instead of being judged constant and hoisted out of
`$.template_effect`, and `typeof '0'`, `'0' + 0`, `'0' === 0`, `'10' < '9'`,
`null + ''` and `true + 1` all fold to what the official compiler folds them to.
