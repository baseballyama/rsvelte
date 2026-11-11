# `3235-rune-name-member-property.svelte.js`

**Issue:** [#3235](https://github.com/baseballyama/rsvelte/issues/3235)

A rune's name used as a **member property** — `o.$derived(1)` is a method call on an object with a `$derived` key. Upstream's `get_global_keypath` walks a member chain down to its BASE identifier, which a property slot never is; the phase-3 rune lowerings located their calls with a byte search that cannot see the `.`, so `o.$effect(() => {})` came out as `o.` — text no JS parser accepts. Carries every rune whose lowering is driven by such a scan plus the three chain shapes that must answer the same (`o?.`, `o.p.`, a `.` on the next line), because the decision is read off the last SIGNIFICANT byte and a single-shape file cannot tell that from a one-byte lookback
