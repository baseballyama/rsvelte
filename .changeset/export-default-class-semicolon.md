---
"@rsvelte/compiler": patch
---

Terminate a module's `export default class … }` with the `;` upstream prints, and fold a semicolon the source already wrote into it instead of emitting a separate empty statement.
