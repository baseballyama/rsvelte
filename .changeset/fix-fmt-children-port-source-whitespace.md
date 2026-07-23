---
"@rsvelte/fmt": patch
---

Classify a text run's boundary whitespace from the pre-collapse source instead of the intermediate multi-pass output, so prose following a hug-broken inline element keeps prettier's word-first fill and wraps at the print width.
