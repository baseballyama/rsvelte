<script>let { item } = $props();
import Child from './Child.svelte';</script>
{#if true}<input bind:value={item.heading} />{/if}