---
"@rsvelte/compiler": patch
"@rsvelte/fmt": patch
---

chore(deps): bump oxc + oxfmt to the 0.58 formatter-paired rev (39677ba)

Bump every git-pinned oxc crate (`oxc_ast`, `oxc_parser`, `oxc_codegen`,
`oxc_span`, `oxc_semantic`, … and the `oxc_formatter*` family) to a single new
revision `39677ba50d908ea09f6d9e58ded328461212f52a` — oxc crates `0.138`,
`oxc_formatter*` `0.58` — and bump the `oxfmt` npm dependency to `^0.58.0` (root
+ playground). This rev is the exact oxc commit the `oxfmt` `0.58.0` release was
built from, so `rsvelte-fmt`'s in-process `oxc_formatter` engine is byte-identical
to the `oxfmt` oracle the formatter-parity gate compares against (fixing a
comment-placement divergence, e.g. `: !!value /* … */;`).

All oxc crates must move to one rev together so rsvelte's AST types unify with
`oxc_formatter`'s transitive deps, and the `oxc_formatter` rev must be paired with
its matching `oxfmt` npm release; this consolidates the individual Renovate oxc
bumps and the `auto-update-oxfmt` bot PR (#1434) into one coherent bump. The bump
is compiler-output-neutral — CSR/SSR compile output is byte-identical across the
whole compat corpus before and after; no oxc API migration was required.

Also declares the `svelte_check` bin with `required-features = ["native"]`: it
links `rsvelte_core::svelte_check::*` (gated on `native`), so under a feature
resolution that omits `native` (e.g. the `cargo codspeed build` bench graph)
cargo must skip the bin instead of trying to build it and failing to link.
Default builds enable `native`, so this is a no-op for them.

The oxfmt 0.58 bump also records one new known formatter-parity failure in the
ratchet (`compat/corpus/fmt-known-failures.json`): `site-kit/…/SearchBox.svelte`,
where rsvelte-fmt over-breaks a TS `as HTMLElement | undefined` union inside a
deeply-nested `on…={…}` handler at print-width 80 (its embedded-expression width
narrowing makes `oxc_formatter` break a union the oxfmt oracle keeps inline). It
is a bounded diagnosis but a non-bounded fix (entangled with the tuned
narrow-then-reindent plumbing), tracked as a follow-up burndown item. Four other
oxfmt-0.58 CSS/structure divergences on pathological svelte compiler-test fixtures
are `oracle-bug` / `invalid-input` exclusions (oxfmt's own `--svelte`-vs-raw CSS
path inconsistencies where rsvelte matches the raw path).
