---
"@rsvelte/lint": patch
---

Add `svelte/no-unused-vars`, a Svelte-aware unused-variable rule for component
scripts. ESLint core's `no-unused-vars` and oxlint both stop at the `.svelte`
boundary, so top-level `<script>` bindings went unchecked unless a project kept
a Svelte-aware ESLint around. The rule reads the compiler's Phase-2 scope tree,
so template reads, `$store` auto-subscriptions and `bind:` targets all count as
uses. It is deliberately conservative: only top-level module/instance-script
declarations are judged, and props (`export let`, `$props()` destructuring,
`$$props`/`$$restProps`/`$$slots`), exported declarations, reactive `$:`
declarations, reassigned/mutated bindings, and names that occur anywhere else
in the source (covering TypeScript type positions the scope tree does not
record) are never reported.
