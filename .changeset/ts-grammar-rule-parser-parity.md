---
"@rsvelte/compiler": patch
---

The parser now raises the TypeScript legality rules `acorn-typescript` raises and stays quiet on the ones it does not, in both directions. OXC enforces TS1147 (an import in a namespace) and TS1194 (a re-export in a namespace) as parse errors while upstream's parser has no such rules, so rsvelte rejected components the official compiler accepts; conversely `export declare global { … }` is a parse error upstream — `'export declare' must be followed by an ambient declaration` — and OXC accepts it, so rsvelte compiled a component the official compiler refuses. A `import x = require()` or `export * from` inside a namespace body is also kept as a non-type node now, so the namespace strip still raises `typescript_invalid_feature` for it instead of silently emptying the namespace.
