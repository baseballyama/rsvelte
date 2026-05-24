# @rsvelte/vite-plugin-svelte-native-darwin-x64

Prebuilt N-API binding (`rsvelte.node`) for the rsvelte Svelte compiler — **macOS x64** (Intel).

**Do not install this package directly.** Install the loader package:

```bash
npm install @rsvelte/vite-plugin-svelte-native
```

The loader will pull in the correct platform binary (this one, if you're on Intel macOS) via `optionalDependencies` and expose the compiler API transparently.

If you're building a SvelteKit / Vite app and want to use the Rust compiler, you probably want [`@rsvelte/vite-plugin-svelte`](https://github.com/baseballyama/vite-plugin-svelte/tree/rsvelte) (the Vite plugin) instead — that fork depends on this binding for you.

Part of the [rsvelte](https://github.com/baseballyama/rsvelte) project — a Rust port of the Svelte 5 compiler and surrounding toolchain.

## License

MIT
