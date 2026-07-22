# @rsvelte/vite-plugin-svelte

A [Vite](https://vitejs.dev) plugin for [Svelte](https://svelte.dev) 5, backed
by the Rust [rsvelte](https://github.com/baseballyama/rsvelte) compiler. It is a
fork of the official [`@sveltejs/vite-plugin-svelte`](https://github.com/sveltejs/vite-plugin-svelte)
whose compile / preprocess / HMR calls route through the rsvelte compiler (via
[`@rsvelte/vite-plugin-svelte-native`](https://www.npmjs.com/package/@rsvelte/vite-plugin-svelte-native))
instead of `svelte/compiler` — a drop-in replacement with the same plugin surface.

> **⚠️ Early stage.** Treat it as experimental.

The Rust compiler ships as a native binding via `optionalDependencies` and is
resolved automatically for your platform.

**Compatibility:** Svelte `^5.0.0`, Vite `6.3+`, `7`, or `8`.

## Which setup are you using?

| Setup | How to wire it up |
| --- | --- |
| **Plain Vite + Svelte** — you call `svelte()` yourself in `vite.config` | [(A) Import the plugin directly](#a-plain-vite--svelte) |
| **SvelteKit** — your `vite.config` only has `sveltekit()` | [(B) Alias it with a package-manager override](#b-sveltekit) |

If you are on SvelteKit, do **not** add `svelte()` to your plugins list — see (B).

## (A) Plain Vite + Svelte

Install the plugin:

```bash
npm install -D @rsvelte/vite-plugin-svelte
# pnpm add -D @rsvelte/vite-plugin-svelte
# yarn add -D @rsvelte/vite-plugin-svelte
```

Add it to your Vite config:

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

The package exposes the same API as the official plugin, including
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

## (B) SvelteKit

In a SvelteKit app your `vite.config` only lists `sveltekit()`, and the Svelte
plugin is loaded **from inside `@sveltejs/kit`** under the package name
`@sveltejs/vite-plugin-svelte` — it never appears in your config. So the way to
swap in rsvelte is to redirect that package's module resolution with a
package-manager override (alias), not to touch `vite.config` at all.

Add the override to your `package.json`, then reinstall:

```jsonc
// pnpm
{
  "pnpm": {
    "overrides": {
      "@sveltejs/vite-plugin-svelte": "npm:@rsvelte/vite-plugin-svelte@^0.4.1"
    }
  }
}
```

```jsonc
// npm
{
  "overrides": {
    "@sveltejs/vite-plugin-svelte": "npm:@rsvelte/vite-plugin-svelte@^0.4.1"
  }
}
```

```jsonc
// yarn (v1 and Berry)
{
  "resolutions": {
    "@sveltejs/vite-plugin-svelte": "npm:@rsvelte/vite-plugin-svelte@^0.4.1"
  }
}
```

Because the override targets the package name, it also redirects the
`import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'` in your
`svelte.config.js` to the rsvelte version — no change needed there either.

### Don't do this

```js
// vite.config.js — ❌ WRONG
import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@rsvelte/vite-plugin-svelte';

export default {
  plugins: [sveltekit(), svelte()] // two Svelte plugins → double compilation
};
```

`sveltekit()` already loads the Svelte plugin internally. Adding `svelte()`
alongside it registers a second one, so every component compiles twice. Use the
override in (B) instead.

## Documentation

Because this is a fork of `@sveltejs/vite-plugin-svelte`, the upstream
[plugin options](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md)
and [FAQ](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/faq.md)
apply.

## License

[MIT](./LICENSE)
