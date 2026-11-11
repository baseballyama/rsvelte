<script>
  let single = $state("a");
  let many = $state(["a"]);
  let area = $state("t");
  let radio = $state("x");
  let boxes = $state([]);
  const options = ["a", "b"];
</script>

<select bind:value={single}>
  {#each options as option}
    <option value={option}>{option}</option>
  {/each}
</select>

<select multiple bind:value={many}>
  <option value="a">a</option>
  <option value="b">b</option>
</select>

<select bind:value={single}>
  <option>plain</option>
  <option selected>selected</option>
</select>

<textarea bind:value={area}></textarea>
<textarea bind:value={area} rows="2"></textarea>

<label><input type="radio" bind:group={radio} value="x" /> x</label>
<label><input type="radio" bind:group={radio} value="y" /> y</label>
<label><input type="checkbox" bind:group={boxes} value="p" /> p</label>
<label><input type="checkbox" bind:group={boxes} value="q" /> q</label>

<b>{single}{many.length}{area}{radio}{boxes.length}</b>
