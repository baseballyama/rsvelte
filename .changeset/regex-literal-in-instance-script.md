---
'@rsvelte/compiler': patch
---

Stop a regex literal from being read as a line comment in a legacy instance script. In `/^https?:\/\//` the slash closing the last escape and the slash closing the regex are adjacent, so the client text passes cut the line there — emitting an unterminated regex, and leaving the prop reads after it uncalled.
