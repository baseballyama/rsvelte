---
'@rsvelte/cli': patch
---

Vue: an attribute name with a non-ASCII character no longer crashes the parser, and compiling it leaves the object key bare as `@vue/compiler-sfc` does (`ä: "1"`, not `"ä": "1"`).
