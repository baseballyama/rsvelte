<script>import Child from './C.svelte';</script>
<svelte:component this={Child} let:value>{#snippet children()}{value}{/snippet}</svelte:component>