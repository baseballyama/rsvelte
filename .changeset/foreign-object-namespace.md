---
"@rsvelte/compiler": patch
---

Switch back to the HTML namespace inside `<foreignObject>` for SSR. The visitor read `metadata.svg` alone, so whitespace between two children of a `<foreignObject>` was dropped as if they were still SVG.
