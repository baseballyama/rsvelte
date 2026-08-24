---
"@rsvelte/compiler": patch
---

Stop reading a backtick inside a block comment as a template-literal delimiter. The client instance-script re-indenter tracked template literals to leave string content byte-for-byte alone, but had no notion of `/* … */`, so a fenced code sample in a JSDoc comment opened a template that swallowed the rest of the comment — every line after the fence lost its indentation, and the output no longer matched the official compiler.
