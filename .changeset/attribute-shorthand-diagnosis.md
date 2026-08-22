---
'@rsvelte/compiler': patch
---

Diagnose a non-identifier `{…}` in attribute position as an empty shorthand

Upstream reads an identifier after the `{` and reports `attribute_empty_shorthand`
at the brace when it is empty. rsvelte brace-scanned the body and handed it to the
expression parser instead, so `{@attac f}` — a one-character typo of `@attach` —
and every other non-identifier body came out as `expected_token` one column late,
while `{#…}` / `{/…}` abandoned the opening tag entirely (which upstream does only
in loose mode).
