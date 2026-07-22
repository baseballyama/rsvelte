---
"@rsvelte/compiler": patch
---

fix(client): resolve bare identifiers via scope in template-chunk `is_defined`, so e.g. a legacy `let iconAsc = "↑"` inside `${cond ? iconAsc : iconDesc}` reads bare without a spurious `?? ''`
