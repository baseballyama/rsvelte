---
'@rsvelte/compiler': patch
---

client: a `$props()` decoy in a string or comment no longer drops the declaration's comment

`props_declaration_comments` located the declaration with
`find_sub("$props()")`, so a `$props()` written inside a string or a comment
earlier in the script took the anchor. The backward `let` search before that
offset then found nothing, the function returned no comments, and the real
declaration's comment was dropped rather than misplaced. It now walks
`js_scan::find_rune_code`, which skips strings, comments, templates and regex
literals.

Both outputs parse and run identically, so only comment text differs.
