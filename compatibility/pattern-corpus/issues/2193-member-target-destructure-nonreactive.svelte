<script>
  let src = { b: 1 };
  let o = $state({ p: 0 });

  function update() {
    ({ b: o.p } = src);
  }
</script>

<button onclick={update}>{o.p}</button>
