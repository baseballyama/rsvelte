---
"@rsvelte/compiler": patch
---

Keep comments in server output. A statement that survives into the SSR module now
carries the comments written above it, including the leading comments of a legacy
`<script>`, instead of every comment being dropped on the way to the server build.

A server-side reparse failure also stops being silent: it used to erase the whole
instance body with no trace, and now reports its diagnostics on stderr.
