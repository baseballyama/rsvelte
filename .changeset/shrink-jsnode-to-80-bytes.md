---
"@rsvelte/compiler": patch
---

Shrink `JsNode` from 144 to 80 bytes by boxing the payloads of its two outlier variants (`Literal`'s regex values and `Program`'s comment/ignore metadata). Compiler output is unchanged.
