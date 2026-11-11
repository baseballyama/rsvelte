<script>
  export let a;
</script>
<C let:options={a}>
  <svelte:fragment slot="title">{a.n}</svelte:fragment>
</C>
