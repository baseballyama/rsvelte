<script>import Child from './C.svelte';</script>
{#snippet row(item)}{#if item}{@const item = 1}{item}{/if}{/snippet}