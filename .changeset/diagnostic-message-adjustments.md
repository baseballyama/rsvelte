---
"@rsvelte/language-server": patch
---

Append the Svelte-specific guidance upstream adds to two TypeScript diagnostics: a component
constructor-type error (TS2345 mentioning `ConstructorOfATypedSvelteComponent`) and
`Modifiers cannot appear here.` (TS1184).
