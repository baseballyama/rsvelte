<script>
 let C;
</script>
<svelte:component this={C} let:item>
{#snippet foo(a)}<p>{a}</p>{/snippet}
{item}
</svelte:component>
