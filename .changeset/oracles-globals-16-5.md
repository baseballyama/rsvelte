---
'@rsvelte/cli': patch
---

`rsvelte lint` now knows the globals that ESLint 10.15.0 knows from `globals` 16.5.0, such as `DigitalCredential`, and that `ErrorEvent` is also a global in `node`.
