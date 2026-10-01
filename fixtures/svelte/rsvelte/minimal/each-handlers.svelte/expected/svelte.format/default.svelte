<script>
  let items = $state(["one", "two", "three"]);
  let picked = $state("");

  function remove(item) {
    items = items.filter((i) => i !== item);
  }
</script>

{#each items as item, i (item)}
  <button onclick={() => (picked = item)}>{item}</button>
  <button onclick={() => remove(item)}>remove {i}</button>
{/each}
<p>picked: {picked}</p>
