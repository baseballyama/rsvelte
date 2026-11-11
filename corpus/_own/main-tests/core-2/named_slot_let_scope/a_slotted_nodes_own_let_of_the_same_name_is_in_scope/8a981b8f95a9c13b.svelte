<script>
  export let controller;
</script>
<C {controller} let:options={a}>
  <svelte:fragment slot="title" let:options={a}>{a.n}</svelte:fragment>
</C>
