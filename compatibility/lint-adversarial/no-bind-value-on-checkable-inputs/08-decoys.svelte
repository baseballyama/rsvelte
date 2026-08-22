<script>
  // bind:value on a checkbox — only a comment
  let v = '';
  let group = [];
  const s = '<input type="checkbox" bind:value={v} />';
</script>

<input type="checkbox" value="static ok" />
<input type="checkbox" bind:group={group} />
<input type="check{'box'}" bind:value={v} />
<input type="checkbox{''}" bind:value={v} />
<textarea bind:value={v}></textarea>
