---
'@rsvelte/compiler': patch
---

Reject a TypeScript-only class-member modifier, and the stage-3 `accessor` keyword, in a plain `<script>` — `private` / `public` / `protected` / `readonly` / `declare` / `abstract` / `override` and `accessor` all compiled here and are a `js_parse_error` in the official compiler, which parses a script without `lang="ts"` using stock acorn. The error lands where acorn stops, which is the token after the first modifier it cannot read rather than the member's key. A `lang="ts"` script is unaffected, except that the two rules acorn-typescript enforces in its parser are now enforced too: an `abstract` member outside an `abstract class`, and an `override` member in a class that extends nothing
