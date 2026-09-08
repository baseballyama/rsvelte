<script>
  import Child from "./Child.svelte";

  let { item } = $props();
</script>

<!-- svelte-ignore ownership_invalid_mutation -->
<svelte:window bind:scrollY={item.y} />

<!-- svelte-ignore ownership_invalid_mutation -->
<svelte:document bind:activeElement={item.el} />

<!-- svelte-ignore ownership_invalid_mutation -->
<svelte:body bind:clientWidth={item.w} />

<!-- svelte-ignore ownership_invalid_mutation -->
<Child bind:value={item.x} />

<!-- svelte-ignore ownership_invalid_mutation -->
<input bind:value={item.heading} />

<!-- svelte-ignore ownership_invalid_mutation -->
{#each [1] as i (i)}
  <input bind:value={item.heading} />
{/each}

<input bind:value={item.title} />
