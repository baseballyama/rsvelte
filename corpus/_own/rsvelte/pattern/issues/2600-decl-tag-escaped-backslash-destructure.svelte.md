# `2600-decl-tag-escaped-backslash-destructure.svelte`

**Issue:** [#2600](https://github.com/baseballyama/rsvelte/issues/2600)

`{const { a = "\\" } = obj}` — the top-level-`=` scan ran past the end, so rsvelte **rejected valid Svelte** with `declaration_tag_invalid_type`. The only entry in this batch whose symptom is an error rather than a text divergence, so the error ratchets are the gate that sees it
