<script>
  let items = $state([{ id: 1, user: { name: 'first' } }, { id: 2, user: { name: 'second' } }]);
  let fallback = $state('fallback');
  let promise = $state.raw(Promise.resolve({ text: 'ready', count: 2 }));
</script>
<button onclick={() => { items[0].user.name = 'changed'; items.reverse(); }}>change</button>
<button onclick={() => { fallback = "next"; promise = Promise.resolve({ text: 'updated', count: 3 }); }}>resolve</button>
{#each items as { id, user: { name } }, index (id)}
  {@const { extra = fallback, ...rest } = {id}}
  {@const [label, position] = [name.toUpperCase(), index + 1]}
  <p>{id}:{name}:{label}:{position}:{extra}:{rest.id}</p>
{/each}
{#await promise}<i>pending</i>{:then {text, count}}<output>{text}:{count}</output>{/await}
{#snippet display({user: {name}}, [position])}<aside>{name}:{position}</aside>{/snippet}
{@render display(items[0], [items.length])}
{#snippet defaults(value = fallback, { text = fallback } = {})}<footer>{value}:{text}</footer>{/snippet}
{@render defaults()}
{@render defaults(undefined, {text: 'explicit'})}
