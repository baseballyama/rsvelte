<script>
  import Child from '../bindable-child/input.svelte';
  let value = $state(2);
  let other = $state(3);
  let visible = $state(true);
</script>
<p>{value}/{other}</p>
<button class="parent" onclick={() => { value += 10; other += 10; }}>parent</button>
<button class="toggle" onclick={() => visible = !visible}>toggle</button>
{#if visible}<Child bind:value bind:other />{/if}
<Child value={20} other={30} />
