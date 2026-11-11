# `2556-public-rune-field-block-comment.svelte`

**Issue:** [#2556](https://github.com/baseballyama/rsvelte/issues/2556)

A block comment leading a public `$state` class field. Rebuilding the field around a synthesized private key must retain the comment between `=` and the state initializer, so dev-mode tagging includes it in `$.tag(...)` rather than emitting it as a separate member.
