<script>
  let flavours = $state(["mint"]);
  const all = ["mint", "lemon", "cherry"];
</script>

<select multiple bind:value={flavours}>
  {#each all as flavour}
    <option value={flavour}>{flavour}</option>
  {/each}
</select>
<p>{flavours.join(", ")}</p>
