<script>
 let C;
</script>
<svelte:component this={C}>
{#snippet foo(a)}{a}{/snippet}
{#snippet bar()}b{/snippet}
</svelte:component>
