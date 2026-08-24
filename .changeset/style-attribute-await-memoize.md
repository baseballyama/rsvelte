---
'@rsvelte/compiler': patch
---

Hoist an awaited `style` attribute value out of the client `template_effect` arrow. All three arms of the style value builder passed a literal `has_await: false` to the memoizer, so `<div style={await p}>` emitted `await` inside a non-async arrow — output no JS parser accepts
