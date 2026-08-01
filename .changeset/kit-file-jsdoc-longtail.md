---
"@rsvelte/svelte-check": patch
---

Three SvelteKit kit-file augmentation divergences from official svelte-check are gone. JSDoc tags are now delimited the way TypeScript's scanner does it — a tag ends at the next `@` that follows whitespace, so several tags may share one line — instead of one tag per line, so `/** @typedef {string} S @type {X} */` suppresses the injected annotation exactly where official does (an `@` glued to the previous word, or inside an inline `{@link …}`, still reads as prose). The JSDoc signature written for API-route handlers and params matchers in `.js` files now matches official's text, `/** @type {(arg0: T) => R} */`, using the synthetic `arg0` and the non-async return type. And a rest parameter now counts towards official's single-parameter check: `entries(...args)` is left alone instead of being typed as if it took none, and `load = (...args) => …` is augmented instead of skipped.
