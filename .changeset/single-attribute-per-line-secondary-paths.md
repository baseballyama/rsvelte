---
"@rsvelte/fmt": patch
---

Honour `singleAttributePerLine` in the two tag printers that ignored it. An element
whose children are a whitespace-separated run of `{#if}` / `{@render}` nodes is
re-printed by a separate doc path that joined attributes with a soft `line`, so the
option was silently dropped; and the top-level `<script>` / `<style>` open tag only
wrapped when it overflowed the print width. Both now break every attribute onto its
own line for multi-attribute tags, matching `prettier-plugin-svelte`.
