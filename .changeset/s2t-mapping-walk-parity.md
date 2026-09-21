---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

svelte2tsx: the source-map walk emits the segments magic-string emits

`MagicString`'s mapping walk diverged from `magic-string@0.30.11` on four
points, verified by replaying the same calls through the oracle: an unedited
chunk emitted one segment past its last character, a surrogate pair mapped once
instead of once per UTF-16 unit, a multi-line edited chunk mapped only its first
generated line, and the trailing `outro` advanced the cursor so the encoded
mappings carried lines upstream never writes.
