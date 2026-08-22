---
"@rsvelte/compiler": patch
---

Place comments around rune-lowered declarations where the official compiler's esrap cursor flushes them — inside a synthesized thunk's parameter parens, ahead of a `$state`/`$derived` argument, and between a `$props()` destructure's kept declarators — on client, server and dev targets alike (#3059).
