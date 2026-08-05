# @rsvelte/language-server-darwin-arm64

Prebuilt [`@rsvelte/language-server`](https://www.npmjs.com/package/@rsvelte/language-server) binary for **macOS arm64** (Apple Silicon).

**Do not install this package directly.** Install the loader package:

```bash
npm install -D @rsvelte/language-server
```

The loader will pull in the correct platform binary (this one, if you're on macOS arm64 (Apple Silicon)) via `optionalDependencies` and invoke it transparently.

Part of the [rsvelte](https://github.com/baseballyama/rsvelte) project — a Rust port of the Svelte 5 compiler and surrounding toolchain.

## License

MIT
