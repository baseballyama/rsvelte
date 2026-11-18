<script>
  let v = '';
  let checked = false;
  let group = [];
</script>

<input type="checkbox" bind:value={v} />
<input type="radio" bind:value={v} />
<input type="text" bind:value={v} />
<input type="checkbox" bind:checked />
<input type="radio" bind:group={group} value="a" />
<input bind:value={v} />
