---
"@rsvelte/compiler": patch
---

Fix two warning-parity divergences that both come from a slot the check never reached.

`get_static_value` in the a11y checker collapsed a valueless attribute into the string `"true"`, where upstream keeps `null | true | string` and folds `true` back to `null` in `get_static_text_value`. `<div role>` was therefore looked up as an unknown role, `<div tabindex>` reached neither tabindex rule, and every `=== 'true'` comparison (`aria-hidden`, `aria-disabled`, a `<track kind>`) answered the wrong way. The numeric checks also parsed with `i32::from_str`, so `tabindex=""`, `"1.5"` and `" 2 "` fell through where upstream's `Number()` does not.

`bidirectional_control_characters` is raised upstream from a `Text`, a `Literal` and a `TemplateElement` visitor, all of which zimmerframe reaches anywhere in the AST. rsvelte ran the `Text` scan on fragment text only and never reached the other two from a template expression, so an attribute or directive value and any string or template literal inside `{...}` were silent on every host.
