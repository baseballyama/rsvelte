<script>
  import Child from '../component-snippets-child/input.svelte';
  let count = $state(1);
  let visible = $state(true);
</script>
<button class="count" onclick={() => count++}>count {count}</button>
<button class="toggle" onclick={() => visible = !visible}>toggle</button>
{#if visible}
  <Child value={count}>
    {#snippet header(value)}<h2>header {value}/{count}</h2>{/snippet}
    <p>children {count}</p>
  </Child>
{/if}
{#each [1, 2] as item}
  <Child value={item}>
    {#snippet header(value)}<h3>{item}/{value}/{count}</h3>{/snippet}
    <span>{item}/{count}</span>
  </Child>
{/each}
