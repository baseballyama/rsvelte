---
"@rsvelte/fmt": patch
---

Match `oxfmt` / prettier-plugin-svelte for `<style>` indentation and blank lines, so `rsvelte-fmt` output round-trips through `oxfmt --check`.

- **`<style>` re-indentation**: the formatted CSS body is now re-indented one level under the `<style>` tag and placed on its own lines, instead of being glued onto the open tag (`<style>.foo {`). The body is dedented before formatting so repeated runs stay idempotent (multi-line comments / strings no longer accumulate indentation).
- **Blank lines**: a single blank line is now preserved between markup siblings and where markup abuts the root `<script>` / `<style>` (the conventional blank line after `</script>`). Runs of blank lines collapse to one, and leading/trailing blanks just inside an element are removed.

On a 1,115-file Svelte corpus this cut the files that differ from `oxfmt` from 1,095 to 270 (the remainder is `<script>`/markup divergence tracked separately), with zero parse failures and full idempotency.
