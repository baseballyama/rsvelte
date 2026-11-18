<svelte:options css="injected" />
<script>
  let items = $state([1, 2, 3]);
  function move(element, { from, to }, duration) {
    const distance = from.top - to.top;
    element.dataset.move = String(distance);
    return { duration, css: (t) => `transform: translateY(${distance * (1 - t)}px)` };
  }
</script>
<button onclick={() => items.reverse()}>reverse</button>
<button onclick={() => items = [...items, items.length + 1]}>add</button>
<button onclick={() => items = items.slice(1)}>remove</button>
<ul>
  {#each items as item, index (item)}
    {@const label = item + ':' + index}
    <li animate:move={800}>{label}</li>
  {/each}
</ul>
<style>
  ul { margin: 0; padding: 0; }
  li { display: block; height: 32px; width: 40px; }
</style>
