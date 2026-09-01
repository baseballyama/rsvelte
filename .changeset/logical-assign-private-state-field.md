---
'@rsvelte/compiler': patch
---

Ship the fix for `??=` / `||=` / `&&=` on a private `$state` field in
`compileModule`: the logical compound is split into a read plus a conditional
write instead of being emitted as an assignment into `$.get(...)`, which is not
valid JavaScript and fails `vite build`
