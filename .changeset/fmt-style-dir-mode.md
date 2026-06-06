---
"@rsvelte/fmt": patch
---

perf(fmt): hand inline `<style>` blocks to oxfmt as a directory, not N explicit paths (#707)

On a cold run (cache miss — first run, or CI without a persisted cache) the batched inline-`<style>` pass staged every extracted CSS body into a temp dir and invoked `oxfmt s0.css s1.css … sN.css` with one explicit path per block. A multi-hundred-entry argv defeats oxfmt's parallel directory walk (and at scale risks `ARG_MAX`), making the cold path slower than it needs to be.

`rsvelte-fmt` now passes the staging directory itself (`oxfmt <dir>`) and reads the results back by their known `s{i}` names. The staging dir holds only our files and is cleared before each batch, so the walk formats exactly the set we read back. Output is byte-identical — same `oxfmt`, same forced `-c` config — and warm runs are unchanged (still served from the `<style>` cache). The two oxfmt subprocesses (non-`.svelte` delegation and the CSS batch) already overlap via `rayon::join`.
