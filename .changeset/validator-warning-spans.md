---
"@rsvelte/compiler": patch
---

Report upstream-accurate source positions on every validation warning

Warning positions diverged from the official compiler on 63 validator fixtures.
The bulk was accessibility: `a11y::check_element` returned span-less warnings and
the caller back-filled all of them with the whole element's range, so every a11y
diagnostic pointed at `<div …>` instead of the offending attribute. The rest were
per-rule — `$:` placement, unused exports, store/rune conflicts, custom-element
props, quoted component attributes, implicit element closes.

Also fixed along the way:

- `ParseWarning` now carries a span, so `element_implicitly_closed` survives the
  hop from the parser into analysis with a position instead of losing it.
- `unknown_code` / `legacy_code` are emitted from the node that collects the
  preceding comment rather than up front, matching upstream's ordering.
- `compile_module` marks its input as a module directly instead of inferring it
  from a `.svelte.(js|ts)` filename, which callers need not supply.
- The `context` attribute stays on the `Script` node, as upstream's `read_script`
  leaves it, so `script_context_deprecated` can point at it.
