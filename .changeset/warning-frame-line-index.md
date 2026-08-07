---
'@rsvelte/compiler': patch
---

Build a warning's code frame from the shared line index instead of splitting the whole source once per warning, so a file with many spanned warnings no longer costs O(source × warnings).
