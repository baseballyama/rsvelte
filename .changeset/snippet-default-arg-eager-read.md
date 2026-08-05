---
"@rsvelte/compiler": patch
---

Dev-mode client output now eagerly reads a snippet parameter that has a default value, e.g. `{#snippet item(id = default_arg())}` now emits `$.get(id);` right after `let id = $.derived_safe_equal(() => $.fallback($$arg0?.(), default_arg, true))`. Upstream emits that read so a default expression referencing a not-yet-initialized binding still throws `Cannot access x before initialization` in dev. rsvelte only emitted it for destructured snippet parameters; the plain `name = default` parameter took a separate code path that skipped it.
