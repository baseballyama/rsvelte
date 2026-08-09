---
'@rsvelte/compiler': patch
---

Keep a legacy `{#each}` collection as an AST node when a reassigned item reads it back as `collection[$$index]`, so a collection that binds looser than member access keeps its parentheses (`($.get(list) ?? [])[i]`, not `$.get(list) ?? [][i]`) and an optional chain is closed before the index is appended
