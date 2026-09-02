---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

A prop widener that would land on the script's last byte is no longer emitted, because
upstream discards it there.

`preprendStr` overwrites the single character at its insertion point rather than appending,
so `propTypeAssertToUserDefined`'s `;x = __sveltets_2_any(x);` at `declaration.end` is
overwritten by the `</script>` removal when the declaration is the last thing in the script.
Any trailing byte — a space, a tab, a comment, a `;`, a newline — moves the insertion point
and the widener survives. The same position carries the SvelteKit `./$types.js` annotation
when the declaration ends at its name, so that is lost with it. Reported as
`upstream_issues/svelte2tsx-preprendstr-insertion-at-the-script-end-is-overwritten.md`.
