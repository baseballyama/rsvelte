<script>import Child from './Child.svelte';
export let x;</script>
<Child bind:v={$x} />