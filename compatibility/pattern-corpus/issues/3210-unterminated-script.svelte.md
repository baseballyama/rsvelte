# `3210-unterminated-script.svelte`

**Issue:** [#3210](https://github.com/baseballyama/rsvelte/issues/3210)

An unclosed `<script>`. Upstream distinguishes the two end-of-input shapes by whether `read_until` was ENTERED at the end (`unexpected_eof`) or ran out inside the body (`element_unclosed`); rsvelte guessed from whether the body contained `<` or `{`
