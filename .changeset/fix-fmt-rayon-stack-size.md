---
"@rsvelte/fmt": patch
---

fix(fmt): give rsvelte-fmt's rayon pool an explicit 8 MiB stack (#1838)

`rsvelte-fmt` formats files in parallel on rayon workers, which fall back to
`RUST_MIN_STACK` / the platform default (~2 MiB) unless a pool sets its own
`stack_size`. In an unoptimized (debug) build, the formatter's own recursive
printer can overflow that stack at a nesting depth the parser itself still
accepts — just under `MAX_NESTING_DEPTH` (see #1794/#1837) — crashing a
debug-build worker on otherwise valid input. `run()` now builds a dedicated
rayon `ThreadPool` with an explicit 8 MiB stack and runs every rayon call in
the pipeline (the Tailwind class-collection scan and the
Svelte/JS/JSON/CSS/`oxfmt` join tree) through it, so the override always
wins regardless of `RUST_MIN_STACK`.
