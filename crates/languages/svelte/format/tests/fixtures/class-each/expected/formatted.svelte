<script>
  let selected = $state(1);
  let items = $state([
    { id: 1, name: "one", done: false },
    { id: 2, name: "two", done: true },
  ]);
</script>

<ul>
  {#each items as item (item.id)}
    <li
      class:selected={item.id === selected}
      class:done={item.done}
      class="row"
    >
      <button
        class={{ current: item.id === selected }}
        onclick={() => (selected = item.id)}
      >
        {item.name}
      </button>
    </li>
  {/each}
</ul>
