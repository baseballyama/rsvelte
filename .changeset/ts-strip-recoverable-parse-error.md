---
'@rsvelte/compiler': patch
---

Strip TypeScript when OXC reports a rule the official parser does not enforce, instead of emitting the component's type annotations into the generated module (client) or dropping its whole instance script (server)
