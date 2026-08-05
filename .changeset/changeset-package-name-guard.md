---
"@rsvelte/compiler": patch
---

Fix a changeset that named the non-existent package `@rsvelte/check` instead of
`@rsvelte/svelte-check`, which broke the Release workflow's release-plan assembly
on `main` and blocked every release. The Changeset CI gate now validates that
every package named in a pending changeset actually exists in the pnpm workspace,
so this class of typo fails on the PR instead of on `main`.
