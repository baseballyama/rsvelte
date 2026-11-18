<script>
  import Child from '../component-child/input.svelte';
  let color = $state('red');
  let size = $state(10);
</script>
<button class="update" onclick={() => { color = color === 'red' ? 'blue' : 'red'; size++; }}>update</button>
<Child --color={color} --size="{size}px" count={size} />
{#each [1, 2] as item}
  <Child --color={color} --item={item} count={size + item} />
{/each}
