---
"@rsvelte/fmt": patch
---

fix(fmt): honor `.oxfmtrc` in inline `<script>`/`<style>` and cover the full oxfmt file set on directories (#693, #694)

Two formatter fixes for using `rsvelte-fmt` as a drop-in project formatter:

- **#693 — inline blocks now respect the project `.oxfmtrc`.** Standalone files delegated to `oxfmt` already discovered the config, but inline `<script>` blocks (formatted in-process by `oxc_formatter`) and inline `<style>` blocks (staged in a temp dir, out of reach of oxfmt's own cwd discovery) were formatted with defaults — so e.g. `singleQuote: true` was ignored and every string in a component flipped to double quotes. `rsvelte-fmt` now resolves `.oxfmtrc.json` / `.oxfmtrc.jsonc` (upward from the working directory, or via a new `--config`/`-c` flag) and applies it to inline blocks: `singleQuote`, `semi`, `printWidth`, `tabWidth`, `useTabs`, `trailingComma`, `quoteProps`, `arrowParens`, `bracketSpacing`, `bracketSameLine`, and `endOfLine` now match standalone files. Explicit `--print-width` / `--tab-width` / `--use-tabs` flags still win.

- **#694 — directories now cover the full oxfmt-supported set.** The walker hard-coded 9 extensions, silently skipping `.md` / `.yaml` / `.toml` / `.html` (and anything else oxfmt supports), so `rsvelte-fmt .` formatted strictly fewer files than `oxfmt .`. Directory inputs are now delegated whole to a single `oxfmt` invocation (with a `!**/*.svelte` exclude so the in-process Svelte pass keeps those, and `--no-error-on-unmatched-pattern` so a Svelte-only tree is a clean no-op). Coverage now matches `oxfmt .` and is `.gitignore`-aware, while the two passes still run in parallel.
