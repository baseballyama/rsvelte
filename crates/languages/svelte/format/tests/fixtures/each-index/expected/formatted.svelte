<script>
  let { items } = $props();
</script>

<ol>
  {#each items as item, i}
    <li>{i + 1}: {item}</li>
  {/each}
</ol>
<p>{items.length} items</p>
