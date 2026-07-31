---
"@rsvelte/compiler": patch
---

Give `JsNode`'s serde map serializer a capacity hint instead of starting every node's map at 0 and growing it by rehashing. Output is unchanged (capacity is only a hint, and `serde_json`'s writer serializer ignores it). Hygiene change: 21 interleaved A/B pairs over a real-world corpus show a modest ~1.9% reduction in user CPU, but it's not a headline win on its own.
