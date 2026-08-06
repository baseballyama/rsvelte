---
"@rsvelte/compiler": patch
---

Route the Phase-3 destructuring and SSR-helper delimiter scans through the shared JS lexer, so a bracket, comma, colon or `=` inside a comment, string, template or regex literal no longer moves a depth counter
