<script>
  export let controller;
</script>
<C {controller} let:options={a}>
  <span slot="title">{a.n}</span>
</C>
