<script>
  let {
    c: [d],
  // x, y
  } = { c: [2] };
  function inc() { d++; }
</script>
<button onclick={inc}>{d}</button>
