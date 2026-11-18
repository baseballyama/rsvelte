<script>let { item } = $props();
import Child from './Child.svelte';</script>
{#each [1] as i}<input bind:value={item.heading} />{/each}