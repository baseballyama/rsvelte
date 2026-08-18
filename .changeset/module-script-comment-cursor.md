---
"@rsvelte/compiler": patch
---

Keep the `<script module>` comments official keeps. The client output dropped every comment that was not lexically inside a function or class body, but the module's builder-made `Program` only leaves esrap's comment cursor dead until a located body revives it — so a comment *after* a class body, a bare block or a static block still reaches the output. Both that rule and the rune-accessor kill are now one walk over the same cursor events.
