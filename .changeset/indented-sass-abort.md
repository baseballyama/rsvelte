---
"@rsvelte/compiler": patch
---

Compile an indented `<style lang="sass">` block instead of aborting: the base-indentation
removal now runs before `grass` sees the document, because the `catch_unwind` it was reached
from does nothing under the `panic = "abort"` release profile.
