---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

Two fixes to the JSDoc a prop carries into the emitted `props:` object.

`createReturnElements` writes `\n${doc}${name}`: the comment is preceded by a
newline and followed by nothing. rsvelte wrote the comment followed by a space,
which oxfmt normalizes away — so the corpus gate could not see it, while raw
output differed on 738 of 33,901 components.

`getLastLeadingDoc` also removes every `@typedef` tag from the comment before it
reaches the prop, and rsvelte kept them. That removal is offset by `node.pos` in
upstream, because `tag.pos` is SourceFile-absolute and is indexed into a
node-relative slice, so it only lands when the declaration is the script's first
statement. rsvelte reproduces that: `@typedef` tags are stripped when nothing
precedes the comment and kept otherwise. The remaining case — a shift that lands
inside the comment, where upstream deletes the wrong text — is filed as
`upstream_issues/svelte2tsx-getlastleadingdoc-mixes-absolute-and-relative-offsets.md`
and is not reproduced; no corpus component reaches it.
