<script>
  let url = 'https://example.com/';
  let base = 'https://example.com';
</script>

<a href={url} target="_blank">mustache href, flag</a>
<a href="{base}/path" target="_blank">mustache first part, flag (dynamic)</a>
<a href="https://host/{url}" target="_blank">literal external first part, flag</a>
<a href="page/{url}" target="_blank">relative literal + mustache, flag (dynamic)</a>
