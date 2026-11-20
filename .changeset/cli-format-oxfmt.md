---
'@rsvelte/cli': minor
---

`format` is now oxfmt with a built-in Svelte formatter. It formats each file type that oxfmt formats in Rust, and it takes the options and the `.oxfmtrc.json` of oxfmt. It no longer reads `.prettierrc` or the `prettier` field of `package.json`.
