---
---

chore(lint): port the final `no-unused-svelte-ignore` rule and enforce full rule coverage

Completes the eslint-plugin-svelte rule port — all 80 upstream rules are now
registered and parity-verified. The compat oracle gains a coverage gate (every
upstream rule fixture dir must map to a registered rule or a documented
out-of-scope waiver) and a dead-skip gate (every `SKIP` entry must still match a
real fixture), so "all rules stay ported" is a CI-enforced invariant. No
published-package code changes (`rsvelte_lint` is `publish = false`).
