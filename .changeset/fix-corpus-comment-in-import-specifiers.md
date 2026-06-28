---
"@rsvelte/compiler": patch
---

fix(compiler): strip comments when collapsing multi-line import specifiers

`cleanup_import_line` joins a hoisted multi-line `import { … }` onto a single
line with spaces. A `//` comment between specifiers —

```js
import {
  AppBar, AppLayout, Button, ThemeSelect,
  // ThemeSwitch,
  Tooltip, settings
} from 'svelte-ux';
```

— was folded inline, commenting out the rest of the statement (including
`} from '…'`) and producing invalid JS. Strip `//` and `/* … */` comments (via
`strip_js_comments`, which respects the module-specifier string) before the
line-join, mirroring esrap which drops these comments. Clears
`layerchart/.../routes/+layout.svelte` from the corpus baseline (54 → 53).
