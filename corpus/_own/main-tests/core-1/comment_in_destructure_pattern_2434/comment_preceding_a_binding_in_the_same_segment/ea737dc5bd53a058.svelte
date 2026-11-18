<script>
  let {
    a,
    // note
    c: [d],
  } = { a: 1, c: [2] };
  function inc() { d++; }
</script>
<button onclick={inc}>{d}</button>
