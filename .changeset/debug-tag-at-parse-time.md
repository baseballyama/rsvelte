---
"@rsvelte/compiler": patch
---

Raise `debug_tag_invalid_arguments` in the parser, where the official compiler raises it, so it competes with other parse errors by source position. It had been an analysis-time check, which only became observable once the `<svelte:...>` placement errors moved to the parser: `{@debug user.name}<div><svelte:window /></div>` reported the placement error rather than the debug one.
