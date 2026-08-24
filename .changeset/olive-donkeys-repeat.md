---
"@rsvelte/compiler": patch
---

Keep an `import` statement's attributes clause (`with { … }`) attached to the import when it is not written on the same line as the module specifier. The client script pipeline ended the statement at the specifier, hoisted the import without its clause and emitted the clause into the component body, which no JavaScript parser accepts.
