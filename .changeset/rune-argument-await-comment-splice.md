---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(compiler): with `experimental.async`, a comment in front of an `await` that is a rune's argument or an assignment's value (`$derived(/* c */ await load())`, `$state(/** @type {T} */ (await load()))`, `x = /* c */ await load()`) no longer produces unparseable client dev output, and a comment right after `await` inside `$derived` (`(await /* c */ load()) + 1`) no longer yields an empty `$.save()`.
