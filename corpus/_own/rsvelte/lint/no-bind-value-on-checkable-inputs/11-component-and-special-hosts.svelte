<script>
  import Input from './01-basic.svelte';
  let tag = 'input';
  let v = '';
</script>

<Input type="checkbox" bind:value={v} />
<svelte:element this={tag} type="checkbox" bind:value={v} />
<svelte:element this="input" type="radio" bind:value={v} />
