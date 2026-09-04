---
"@rsvelte/fmt": patch
"@rsvelte/language-server": patch
---

Re-express a `<style>` body's residual tabs as the configured indent unit. The block indent prepended to the CSS is built from that unit, so a tab-indented body the engine passed through verbatim — a rejected body, or a comment's own leading whitespace inside a declaration value — came out as spaces and tabs on one line, honouring neither `useTabs` setting.
