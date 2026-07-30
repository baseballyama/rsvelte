---
"@rsvelte/compiler": patch
---

fix(compiler): mirror the destructuring lowering fixes on the server target — keep computed and literal keys in `$derived` / `$state` destructures, list computed keys in `$.exclude_from_object`, and emit the rest leaf without a `$.to_array` length for array patterns ending in a rest element
