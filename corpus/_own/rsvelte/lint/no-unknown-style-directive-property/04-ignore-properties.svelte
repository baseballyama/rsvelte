<script>
  /* eslint svelte/no-unknown-style-directive-property: ["warn", { "ignoreProperties": ["/^my-/i", "exact-prop"] }] */
</script>

<div style:my-thing="1">regex ignored ok</div>
<div style:MY-CASED="1">case-insensitive regex ok</div>
<div style:exact-prop="1">exact ignored ok</div>
<div style:exact-prop-longer="1">not exact, flag</div>
<div style:other-thing="1">flag</div>
