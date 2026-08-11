---
"@rsvelte/compiler": patch
---

Prevent the internal empty-statement placeholder for removed `$inspect` calls
from reaching generated client output when comments change printer whitespace.
