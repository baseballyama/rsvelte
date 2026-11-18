<script>let { item } = $props();
import Child from './Child.svelte';</script>
<!-- svelte-ignore ownership_invalid_mutation -->
{#each [1] as i}<input bind:value={item.heading} />{/each}