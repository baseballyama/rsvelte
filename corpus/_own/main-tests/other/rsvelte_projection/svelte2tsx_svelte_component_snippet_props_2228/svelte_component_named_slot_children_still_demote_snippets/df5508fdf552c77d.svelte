<script>
 let C;
</script>
<svelte:component this={C}>
<div slot="x" let:item>{item}</div>
{#snippet foo(a)}<p>{a}</p>{/snippet}
</svelte:component>
