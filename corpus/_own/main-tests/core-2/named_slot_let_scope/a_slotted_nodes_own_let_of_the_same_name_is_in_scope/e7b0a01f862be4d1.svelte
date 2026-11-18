<script>
  export let controller;
</script>
<C {controller} let:options={a}>
  <span slot="title" let:options={a}>{a.n}</span>
</C>
