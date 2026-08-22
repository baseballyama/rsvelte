<script>
  import Comp from './01-basic.svelte';
  let tag = 'div';
</script>

<Comp style="color: red">component style attr, oracle kind !== html, ok</Comp>
<svelte:element this={tag} style="color: red">special kind, ok for oracle</svelte:element>
<svelte:element this={tag} style:color="red">style directive on svelte:element</svelte:element>
