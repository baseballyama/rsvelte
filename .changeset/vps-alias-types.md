---
"@rsvelte/vite-plugin-svelte": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(vps): the published types resolve under the SvelteKit override alias and match `svelte/compiler`. Installed as `@sveltejs/vite-plugin-svelte`, as the README's SvelteKit setup does, every import of the plugin failed type-checking with "is not a module", because dts-buddy declares the types under `@rsvelte/vite-plugin-svelte` only; a module entry now re-exports them under whichever name the package is installed as. The public types also imported `@rsvelte/compiler`, which the plugin does not depend on; they now use `svelte/compiler`, as upstream does, so user preprocessors, `vitePreprocess()` and `compilerOptions` type-check against the official API. `@rsvelte/vite-plugin-svelte-native` types the `markup` it always passes to script and style preprocessors as required, as upstream does.
