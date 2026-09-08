---
'@rsvelte/compiler': patch
---

Keep a comment written inside a destructured `$props()` pattern, at the position upstream prints it. The client's state transform replaces source ranges rather than reprinting, and a read-only destructure is replaced by nothing, so `let { a /* c */ } = $props()` deleted the comment along with the declaration. Where the comment did survive it was pushed to the front of the script instead of flushed before the first node that follows it, so a declaration preceded by another statement printed it in the wrong place. A comment inside an erased type annotation is deliberately not carried; that is a separate defect and stays open.
