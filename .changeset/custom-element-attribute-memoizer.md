---
"@rsvelte/compiler": patch
---

Route a custom-element attribute through its own memoizer, so an `await` in its value reaches `template_effect`'s async slot instead of being inlined into a non-async arrow
