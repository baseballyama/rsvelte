<script>
  let size = $state('m');
  let note = $state('none');
</script>

<select class="size" bind:value={size}>
  <option value="s">small</option>
  <option value="m">medium</option>
  <option value="l">large</option>
</select><input class="note" bind:value={note} />
<p class="summary">size {size}, note {note}</p>
