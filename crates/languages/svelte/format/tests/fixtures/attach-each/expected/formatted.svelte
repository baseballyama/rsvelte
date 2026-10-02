<script>
  let items = $state([
    { id: 1, label: "a" },
    { id: 2, label: "b" },
  ]);

  function highlight(item) {
    return (node) => {
      node.dataset.label = item.label;
    };
  }
</script>

<ul>
  {#each items as item (item.id)}
    <li {@attach highlight(item)}>{item.label}</li>
  {/each}
</ul>
{#if items.length > 1}
  <section><h2 {@attach highlight(items[0])}>first</h2></section>
{/if}
