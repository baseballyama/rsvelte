# `global-block-body-uses-the-rule-visitor.svelte`

**Issue:** corpus residue

Upstream visits a `:global { … }` block's body with the same `Rule` / `Atrule` visitors as any other block, so its children get the empty check, the unused check and the nested-`:global {}` recursion; only the scoping is skipped. rsvelte copied each child **verbatim** in non-minify mode with deletion ranges applied, and a deletion can express `remove_global_pseudo_class` while an insertion cannot — so `/* (empty) … */` was never emitted and a nested empty rule survived. The `.x :global` rule at the end is the control: a descendant-position block is an ordinary rule whose children already took that path. The `-global-` keyframes and the nested `:global(i)` are the regression half — both were green before the change and cover the work the deleted verbatim path did, which no existing cell measured. Only `client` and `server` move: the empty-rule elision sits under `!ctx.dev`.
