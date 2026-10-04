<script>
  let groups = $state([
    { id: 1, items: [{ id: 1, name: 'apple' }, { id: 2, name: 'banana' }] },
    { id: 2, items: [{ id: 3, name: 'cherry' }] },
  ]);

  function reverse() {
    groups.reverse();
    groups.forEach((group) => group.items.reverse());
  }
</script>

<button class="reverse" onclick={reverse}>reverse</button>
<button class="clear" onclick={() => (groups = [])}>clear</button>
<button class="restore" onclick={() => (groups = [{ id: 3, items: [{ id: 4, name: 'date' }] }])}>restore</button>
{#each groups as group, i (group.id)}
  <section>
    <h2>{i}: {group.id}</h2>
    {#each group.items as item, j (item.id)}
      <button class="item" onclick={() => (item.name += '!')}>{i}.{j}: {item.name}</button>
    {/each}
  </section>
{:else}
  <p>empty</p>
{/each}
