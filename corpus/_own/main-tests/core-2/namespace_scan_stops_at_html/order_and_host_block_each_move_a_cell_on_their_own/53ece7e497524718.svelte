<script>import C from './C.svelte'; let a=1,b=2;</script>
{#if a}<C /> text{:else if b}<svg><g></g></svg>{/if}
