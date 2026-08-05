---
"@rsvelte/compiler": patch
---

Keep the dev-mode `await` instrumentation from swallowing the next statement, and single-quote the console method name. `(await $.track_reactivity_loss(x))()` can continue a line where the bare `await x` it replaced could not, so a source relying on ASI folded the following statement into a call; and the method name reaches `$.log_if_contains_state` as a plain literal, which esrap prints single-quoted.
