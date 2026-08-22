<script>
  import Comp from './01-ok.svelte';
  let tag = 'div';
  let p = 'color';
</script>

<Comp style="/* c */ color: red">comment on component style attr</Comp>
<svelte:element this={tag} style="{p}: red">key interp on svelte:element</svelte:element>
