# @rsvelte/vite-plugin-svelte

A [Vite](https://vitejs.dev) plugin for [Svelte](https://svelte.dev) 5, backed
by the Rust [rsvelte](https://github.com/baseballyama/rsvelte) compiler. It is a
fork of the official [`@sveltejs/vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte)
whose compile / preprocess / HMR calls route through the rsvelte compiler (via
[`@rsvelte/vite-plugin-svelte-native`](https://www.npmjs.com/package/@rsvelte/vite-plugin-svelte-native))
instead of `svelte/compiler`, so you can build a Vite or SvelteKit app on the
Rust toolchain with the same plugin surface.

> **⚠️ Early stage.** A drop-in replacement for `@sveltejs/vite-plugin-svelte`,
> but treat it as experimental. Supports Vite 6, 7 and 8.

## Install

```bash
npm install -D @rsvelte/vite-plugin-svelte
# pnpm add -D @rsvelte/vite-plugin-svelte
# yarn add -D @rsvelte/vite-plugin-svelte
```

The Rust compiler is pulled in as a native binding via `optionalDependencies`,
resolved automatically for your platform.

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@rsvelte/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      /* plugin options */
    })
  ]
});
```

The plugin exposes the same API as the official plugin, including
`vitePreprocess` and `loadSvelteConfig`:

```js
import { svelte, vitePreprocess } from '@rsvelte/vite-plugin-svelte';

export default {
  plugins: [
    svelte({
      preprocess: [vitePreprocess()]
    })
  ]
};
```

## Documentation

Because this is a fork of `@sveltejs/vite-plugin-svelte`, the upstream
[plugin options](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md)
and [FAQ](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/faq.md)
apply.

## License

[MIT](./LICENSE)
