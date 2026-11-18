<script>
  export let controller;
</script>
<C {controller} let:options={a}>
  <svelte:fragment slot="title">{a.n}</svelte:fragment>
</C>
