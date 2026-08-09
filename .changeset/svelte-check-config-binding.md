---
'@rsvelte/svelte-check': patch
---

Resolve a config exported through a binding — `const config = {...}; export default config;`, `module.exports = config`, and a plugin call whose options are a binding — when reading `compilerOptions` and `kit.files` out of `svelte.config.*` / `vite.config.*`. Only the inline-object and `defineConfig({...})` forms were read before, so a project written the referenced way silently ran with default compiler options
