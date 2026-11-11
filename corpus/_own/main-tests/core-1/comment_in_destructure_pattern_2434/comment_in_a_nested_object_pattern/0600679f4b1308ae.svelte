<script>
  let {
    a: { d },
    // c
  } = { a: { d: 2 } };
  function inc() { d++; }
</script>
<button onclick={inc}>{d}</button>
