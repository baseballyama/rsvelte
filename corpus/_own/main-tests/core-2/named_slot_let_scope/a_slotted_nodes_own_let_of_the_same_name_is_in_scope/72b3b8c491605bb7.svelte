<script>
  export let controller;
</script>
<C {controller} let:options={{ n }}>
  <span slot="title" let:options={{ n }}>{n}</span>
</C>
