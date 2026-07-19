---
"@rsvelte/fmt": patch
---

fix(fmt): preserve full print width for `<script>` bodies when `svelteIndentScriptAndStyle` is disabled

`format_script` always narrowed the configured `printWidth` by one indent
level before formatting the `<script>` body, on the assumption that the body
would subsequently be re-indented one level under the `<script>` tag. That
assumption only holds when `svelteIndentScriptAndStyle` (default `true`) is
enabled; with it disabled the body is spliced back in flush at column 0, so
narrowing the width was wrong and caused lines that fit the real configured
width to wrap unnecessarily. The width is now only narrowed when
`indent_script_and_style` is `true`, matching the already-correct general
pattern used by `format_nested_script` and the `<style>` formatting paths
(`format_nested_style` / `collect_style_edit`), which derive the width
narrowing from the body's actual indent rather than assuming a fixed one
level.
