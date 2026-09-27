---
"@rsvelte/compiler": patch
---

fix(compiler): a client source position can no longer be read as a comment-buffer position. The comment coordinate space started just past the longest span the converter happened to note, so a template identifier past that point (an element's variable, a member's property) sat inside the comment buffer: its source-map segment was translated into an unrelated comment (#4521) and it could flush a pending script comment by accident. The buffer now starts past the whole source. A script comment left pending by a removed `$props()` declaration is flushed before the first template member expression upstream keeps as its own node, as upstream does, and a `$effect` in a TypeScript component maps its callee to the rune instead of to the type-erased script's offset.
