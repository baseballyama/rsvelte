---
"@rsvelte/compiler": patch
---

`parse()` now honours `modern` and `loose`. Upstream's `parse(source, { modern, loose } = {})` passes `loose` to the parser and `modern` to `to_public_ast`; rsvelte's binding declared neither option, so it ignored both and always returned the modern AST — where upstream's default is the **legacy** one — and threw on every document `loose` exists to recover from. Both were already implemented behind the binding (`ParseOptions.loose` is honoured throughout the parser, and `convert_to_legacy` is what the legacy parser-fixture suite exercises); only the option plumbing was missing. Over 14,102 real-world components the legacy axis goes from 0 to 5,456 byte-identical trees against official's.
