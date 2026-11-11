# `4244-erased-annotation-comment.svelte`

**Issue:** [#4244](https://github.com/baseballyama/rsvelte/issues/4244)

A comment left inside an erased TypeScript type that the re-emission dropped entirely. The gate on that re-emission was a conjunction and each term silenced a host on its own — an inline annotation, and a single-line removed region — so the issue's own repro, which trips both, cannot tell a half-fix from a whole one. The comment sits **after** the first member because when this landed, acorn-typescript doubled a comment consumed in a speculative head and the server did not reproduce the doubling, so only a non-doubling shape could be green on all four targets. `@sveltejs/acorn-typescript` 1.0.13 (Svelte 5.57.1) removed the doubling and rsvelte's port of it; the head shapes are covered by `crates/rsvelte_core/tests/type_literal_head_comment_repeat.rs` and `crates/rsvelte_core/tests/erased_annotation_comment.rs`.
