---
"@rsvelte/compiler": patch
---

Skip the instance-script variable scans whose result is already settled

Three whole-script text scans in the client instance-script transform ran on
every component regardless of what the script contained:

- `index_const_state_decls` and `index_reassigned_vars` are read only while
  iterating `local_reactive_vars`, so an empty list makes both unobservable.
- `extract_proxy_vars` pushes nothing without a `$state(` on the line.
- `collect_local_state_decls` inserts nothing without a literal `= $state(`.

Each now returns its empty result from a single `memmem` probe instead of
walking the script. Measured as bytes handed to these scans across four
real-world corpora: huly/plugins skips 6,710,403 of 6,710,403 (2,123 files),
carbon/src 1,605,612 of 1,605,612, open-webui/src 3,767,567 of 3,776,399, and
SMUI — which uses `$state` throughout, so the gates cannot fire — skips only
160,953 of 2,191,645.
