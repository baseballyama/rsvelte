<script>
  let choice = $state("b");
  let items = $state(["a", "b"]);
</script>

<select bind:value={choice}>
  <option value="a">A</option>
  <option value="b">B</option>
  {#each items as item}
    <option>{item}</option>
  {/each}
</select>
<p>{choice}</p>
