---
"@rsvelte/compiler": patch
---

svelte2tsx: project a valueless `popover` attribute as `""` rather than `true`. `popover` is enumerated (`auto` / `manual`), not boolean, so upstream spells it out as the one exception to the valueless-attribute rule; typing it as `boolean` checked `<div popover>` and `<div popover="manual">` against the wrong type.
