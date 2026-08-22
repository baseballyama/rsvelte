<script>
  let text = $state("t");
  let picked = $state("a");
  let many = $state([]);
  let checked = $state(false);
  let group = $state([]);
</script>

<form>
  <input type="text" bind:value={text} />
  <input type="number" bind:value={text} />
  <input type="checkbox" bind:checked />
  <input type="checkbox" value="a" bind:group />
  <input type="radio" value="b" bind:group={picked} />
  <select bind:value={picked}>
    <option value="a">a</option>
    <optgroup label="g"><option value="b">b</option></optgroup>
  </select>
  <select multiple bind:value={many}>
    <option value="a">a</option>
  </select>
  <textarea bind:value={text}></textarea>
</form>

<b>{text}{picked}{many.length}{checked}{group.length}</b>
