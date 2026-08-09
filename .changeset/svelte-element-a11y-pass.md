---
"@rsvelte/compiler": patch
---

Run the a11y pass for `<svelte:element>`

Upstream calls the shared a11y checker from **both** element visitors
(`RegularElement.js` and `SvelteElement.js`); rsvelte had a call site only on the
regular one, so every element a11y rule was silently absent whenever the element
was written as `<svelte:element this={…}>`:

```svelte
<script>
	let tag = 'div';
	function f() {}
</script>

<svelte:element this={tag} on:click={f}>x</svelte:element>
```

Official warns `a11y_no_static_element_interactions`; rsvelte emitted nothing.
This was not one missing rule — it was the whole pass, so `a11y_accesskey`,
`a11y_autofocus`, `a11y_positive_tabindex`, the `aria-*` type and spelling
checks, the `role` checks, `a11y_mouse_events_have_key_events` and the rest were
missing too.

`<svelte:element>` reaches the checker under the literal name `svelte:element`
with `is_dynamic_element` set, so the rules upstream guards on a statically known
tag stay skipped — `a11y_misplaced_scope`, `a11y_aria_activedescendant_has_tabindex`,
`a11y_click_events_have_key_events`, `a11y_no_noninteractive_tabindex` and
`a11y_role_has_required_aria_props` must not fire on a dynamic tag, and do not.

The same port closes upstream's other two `SvelteElement` branches in that file: a
dynamic element between the checked node and its ancestors makes `is_parent`
answer "unknown" (so `a11y_autofocus` / `a11y_figcaption_parent` are suppressed
rather than guessed), and an **empty** `<svelte:element>` child no longer counts
as content for `a11y_consider_explicit_label` / `a11y_missing_content`.

A differential over the reachable a11y rule set — 42 attribute shapes × 10 tag
spellings × 3 targets, 1,416 comparisons — now agrees with official on every one.
