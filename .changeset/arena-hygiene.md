---
"@rsvelte/compiler": patch
---

Release the AST-transform thread-local arena once it grows past 16MB instead of only `reset`-ing it between components. Previously, one outsized component would pin its peak arena size on that thread for the rest of the process — this matters for long-lived Vite/Node dev-server workers. Mirrors the cap svelte-rs applies when returning an arena to its pool. No output change.
