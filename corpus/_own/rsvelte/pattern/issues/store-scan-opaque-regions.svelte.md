# `store-scan-opaque-regions.svelte`

**Issue:** corpus residue

svelte2tsx resolves `$name` store subscriptions from a byte scan, and the scan saw four regions official's TypeScript walk structurally cannot: an aliased import specifier's imported name (`import { $getSelection as getSelection }`), a string literal (a `'./$types.js'` module specifier), a template literal's text, and a `<style>` block (a SCSS `$color`). Each made a neighbouring binding of the same name look like a store. The real subscriptions beside them — a `${…}` interpolation, a template-only read, a `$`-suffixed identifier — are the controls.
