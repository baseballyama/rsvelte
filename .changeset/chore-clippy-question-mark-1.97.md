---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
"@rsvelte/fmt": patch
---

chore: satisfy the stricter `clippy::question_mark` lint on Rust 1.97

Rust 1.97's clippy widened the `question_mark` lint, flagging five pre-existing
`match`/`if let` blocks that hand-propagate `None` as rewritable with `?`. Applied
clippy's autofix in `class_transforms.rs`, `svelte2tsx/script/mod.rs`,
`collapse.rs`, and `script.rs`. The rewrites are semantically identical (they all
return `Option` and `?` propagates `None` exactly as the original early-returns
did); compiler output is unchanged. Unblocks CI clippy, which runs on stable
(now 1.97).
