---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): a plain `.ts` file importing a component a workspace dependency publishes through package.json `exports` (`@scope/pkg/ui/Card.svelte`, or `./cmp/*` patterns) now gets the component's types instead of reporting `TS2307`. Subpaths follow TypeScript's resolution of `exports` (key precedence, `null` exclusions, `types` / `import` / `customConditions` / `default` in declaration order), and a subpath TypeScript sends to a declaration file keeps it.
