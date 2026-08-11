---
"@rsvelte/compiler": patch
---

Preserve reactive context across non-final awaits in async derived declarations
and keep generated destructuring temporaries scoped to their async callback.
