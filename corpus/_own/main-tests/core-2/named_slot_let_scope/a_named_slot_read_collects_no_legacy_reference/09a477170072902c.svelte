<script>
  export let controller;
</script>
<C {controller} let:options={a}>
  <span slot="title"><E>{a.n}</E></span>
</C>
