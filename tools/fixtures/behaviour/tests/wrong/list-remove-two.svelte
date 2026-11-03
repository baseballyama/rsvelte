<script>
  let items = $state([
    { id: 1, name: 'apple' },
    { id: 2, name: 'banana' },
  ]);
  let next = 3;

  function add() {
    items.push({ id: next, name: `item ${next}` });
    next++;
  }

  function removeFirst() {
    items.splice(0, 2);
  }
</script>

<ul>
  {#each items as item, i (item.id)}
    <li>{i + 1}. {item.name}</li>
  {/each}
</ul>
{#if items.length === 0}
  <p>empty</p>
{/if}
<button class="add" onclick={add}>add</button><button class="remove" onclick={removeFirst}>remove first</button>
