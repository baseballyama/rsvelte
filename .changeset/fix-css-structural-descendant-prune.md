---
"@rsvelte/compiler": patch
---

fix(css): prune descendant/child selector chains whose subject or ancestor links cannot match the component's own element tree (attribute/class/id compounds included), and preserve source whitespace after a pruned leading selector-list item
