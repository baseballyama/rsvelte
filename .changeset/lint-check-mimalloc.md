---
'@rsvelte/lint': patch
'@rsvelte/svelte-check': patch
---

`rsvelte-lint` and `rsvelte-check` link the allocator the rest of the tree already uses.

The compiler CLI, the NAPI addon and `rsvelte-fmt` set mimalloc as the global allocator;
these two binaries were still on the macOS system allocator, which a corpus lint profile
puts at 22% of self time in `nanov2_*`/`tiny_*` alone. Measured as a two-arm ABBA over the
33,912-file corpus (one tree, two binaries whose `nm -gU | grep -c mi_malloc` reads 0 and 2),
lint moves 1.285x single-threaded and 1.674x multi-threaded, 6/6 pairwise wins each; the
lint output is byte-identical over 73,799 findings on 6,788 real-world sources.

`rsvelte-check` measures on the report's own 5,000-component workspace: 1.19x on the
Svelte-diagnostics row and null under `--tsgo`, where the type-check backend dominates.
mimalloc is a CLI-only optional dependency of `rsvelte_lint` so the wasm build does not
carry it.
