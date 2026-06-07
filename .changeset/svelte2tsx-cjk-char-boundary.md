---
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): don't panic on multibyte/CJK `<script>` content (#719)

`collect_type_body_deps`'s `typeof` lookbehind sliced `&body[j - 6..j]` with raw byte arithmetic. When non-ASCII (e.g. Japanese / CJK) text preceded an identifier in a `<script lang="ts">` type body — such as `必須) */` ahead of `imageSrc` — `j - 6` could land inside a multibyte UTF-8 char, and the `&str` slice panicked, aborting the entire `--emit-overlay` / `--tsgo` run (and with it every diagnostic for the project). The slice is now guarded with `str::is_char_boundary`; the six bytes can only spell the ASCII keyword `typeof` when `j - 6` is already a char boundary, so behavior is unchanged for ASCII input.
