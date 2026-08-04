---
"@rsvelte/compiler": patch
---

Keep legacy `<script>` comments outside reactive statements: components using `$:`/`$store`/`$$props` no longer lose every comment from their instance script — only comments the official compiler also drops (those attached to a rewritten `$:` statement) are removed.
