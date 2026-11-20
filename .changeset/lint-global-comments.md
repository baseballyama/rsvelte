---
'@rsvelte/cli': patch
---

Lint reads `/* global */` and `/* globals */` comments, so `no-undef` and the rules that track globals see the names they declare or turn off.
