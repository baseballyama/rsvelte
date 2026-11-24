---
'@rsvelte/cli': patch
---

`rsvelte format` now puts an element's content on its own lines instead of hugging `>` and `</`, as `prettier-plugin-svelte` 4.2.0 does.
Elements whose edge whitespace Svelte keeps still hug their content: in `<pre>` or `<textarea>`, a `<title>` in `<svelte:head>`, and a component with `preserveWhitespace`.
`htmlWhitespaceSensitivity: "strict"` keeps hugging as before.
`rsvelte format` now formats `<menu>` as a block element.
`rsvelte format` now keeps an empty `{:catch}` in an `{#await}` block.
`rsvelte format` now prints a string in `<svelte:element this={...}>` with the quotes `singleQuote` picks.
`rsvelte format` now keeps a comment in an opening tag without attributes, and one after the last attribute that holds a `>`.
`rsvelte format` now formats a `<script>` that has a `break` or `continue` without a target, as Prettier 3.10 does.
