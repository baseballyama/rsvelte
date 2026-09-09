---
'@rsvelte/language-server': patch
---

feat(language-server): hover a CSS declaration with its MDN description

`css::hover` answered only `:global(...)`, so hovering `color` in a `<style>`
block or in a static `style="…"` attribute fell through to tsgo, which answered
about the `style` attribute or about nothing at all. `css_data` has carried the
vendored MDN property set and a `getEntryDescription` port since the completion
work; only the consumer was missing.

The `Declaration` arm of `CSSHover.doHover` (`services/cssHover.js`) is now
ported: `CSSDataManager.getProperty` is an exact, case-sensitive lookup on a
name that `Property.getName` strips of a trailing `_`/`+` less merge, and the
reported range is the whole `Declaration` node — so the colon, the value and a
trailing `!important` all answer with the property's own description.
`inStyleAttributeWithoutInterpolation` (`CSSPlugin.ts:256-265`) is ported with
it, which declines the whole `style` attribute when its value holds a `{`.

Measured against the official server over the same 24 offsets: 5/24 identical
before, 17/24 after. The 7 that remain are selector hovers, which
`CSSHover.doHover` answers from its `Selector`/`SimpleSelector` arms via
`selectorPrinting` — not ported here.
