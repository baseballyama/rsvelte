---
"@rsvelte/compiler": patch
---

Report an error raised inside an `export let` declaration's initializer instead of masking it with `legacy_export_invalid`. The official compiler's `ExportNamedDeclaration` visitor opens with `context.next()`, so `export let x = $host()` is `host_invalid_placement` and `export let x = $bindable()` is `bindable_invalid_location`.
