# @rsvelte/svelte-check-linux-arm64-gnu

Prebuilt [`@rsvelte/svelte-check`](https://www.npmjs.com/package/@rsvelte/svelte-check) binary for **Linux arm64 (glibc)**.

**Do not install this package directly.** Install the loader package:

```bash
npm install -D @rsvelte/svelte-check
```

The loader will pull in the correct platform binary (this one, if you're on arm64 Linux with glibc) via `optionalDependencies` and invoke it transparently.

Part of the [rsvelte](https://github.com/baseballyama/rsvelte) project — a Rust port of the Svelte 5 compiler and surrounding toolchain.

## License

MIT
