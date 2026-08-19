<script>
  import C from './01-top-level-ok.svelte';
</script>

<svelte:boundary>
  <style>.x { color: red; }</style>
</svelte:boundary>
<C>
  <svelte:fragment slot="body">
    <style>.y { color: red; }</style>
  </svelte:fragment>
</C>
