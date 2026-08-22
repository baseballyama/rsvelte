---
"@rsvelte/compiler": patch
---

Recognise `onClick={…}` and every other non-lowercase event-attribute spelling as an event handler on the server, instead of rendering the handler function into the HTML. The server's predicate required the character after `on` to be lowercase and did not look at the value, where upstream tests the two-character prefix and requires the value to be a lone expression — so `onClick={f}` and `on={f}` were emitted as attributes while the client target dropped them, making the two halves of the same component disagree.
