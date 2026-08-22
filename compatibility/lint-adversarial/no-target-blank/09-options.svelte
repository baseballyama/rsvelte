<script>
  /* eslint svelte/no-target-blank: ["warn", { "allowReferrer": true, "enforceDynamicLinks": "never" }] */
  let url = 'https://example.com/';
</script>

<a href="https://example.com/" target="_blank" rel="noopener">allowReferrer ok</a>
<a href="https://example.com/" target="_blank" rel="noreferrer">still flag: noopener missing</a>
<a href={url} target="_blank">dynamic link not enforced, ok</a>
<a href="https://example.com/" target="_blank">static external still flag</a>
