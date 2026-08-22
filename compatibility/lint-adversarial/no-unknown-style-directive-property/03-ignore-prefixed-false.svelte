<script>
  /* eslint svelte/no-unknown-style-directive-property: ["warn", { "ignorePrefixed": false }] */
</script>

<div style:-webkit-transform="scale(1)">in known list, ok</div>
<div style:-webkit-totally-bogus="1">now flagged</div>
<div style:-o-fake="1">flagged</div>
