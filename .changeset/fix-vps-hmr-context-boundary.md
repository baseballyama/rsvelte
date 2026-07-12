---
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(vite-plugin-svelte-native): require an attribute boundary for legacy `context="module"` detection

`hmr_diff`'s `is_module_script_attrs` decided whether a `<script …>` opening tag
was the legacy module script with a plain `str::contains("context=\"module\"")`
(and the `'…'` / unquoted variants). That substring check matched inside any
attribute whose name merely *ends* in `context` — e.g. `<script
data-context="module">` — misclassifying an ordinary instance script as the
module script and corrupting the HMR full-reload/hot-update decision.

The bare `module` attribute form already required a whitespace/`=`/`/`/`>`
boundary on both sides (H-094); the three `context=...` literal checks now get
the same treatment via a new `contains_at_attr_boundary` helper, which only
accepts a match starting at the beginning of the attribute text or right after
whitespace.
