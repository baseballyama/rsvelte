<script>
  const s = '<a href="https://x/" target="_blank">in string</a>';
</script>

<!-- <a href="https://x/" target="_blank">comment</a> -->
{@html s}
<a href="https://example.com/" target="_BLANK">value case differs, ok</a>
<a href="https://example.com/" TARGET="_blank">attr name case differs, ok</a>
<a href="https://example.com/" target=" _blank">space in value, ok</a>
<a href="https://example.com/" target="_blank{''}">mustache in target, ok</a>
