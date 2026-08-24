---
"@rsvelte/compiler": patch
---

Order the server's `$$slots` object by the component's children. Upstream keys one `children` record by slot name while walking the children and later emits `Object.keys(children)`, so the object follows the position at which each slot name is first seen; the server port seeded `default` into its own list before walking, so `default` always led and `<C><b slot="named">…</b><i>…</i></C>` emitted `{ default: true, named: … }` where official emits `{ named: …, default: true }`. Object key order is observable JS, and the client target was already correct.
