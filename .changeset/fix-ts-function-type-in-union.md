---
"@rsvelte/compiler": patch
---

fix(parse): preserve `TSFunctionType` / `TSConstructorType` in `convert_ts_type` instead of collapsing them to a `TSUnknownKeyword` stub (e.g. inside a union like `string | (() => void)`)
