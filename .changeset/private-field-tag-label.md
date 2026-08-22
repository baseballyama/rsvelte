---
"@rsvelte/compiler": patch
---

Keep the `#` in the dev-mode `$.tag` label for a class field the user wrote as private. The pass ran after the public-field lowering and reconstructed the original name from the generated accessor pair, but a hand-written private accessor lowers to byte-identical text — so the pre-lowering script is now threaded in and settles it.
