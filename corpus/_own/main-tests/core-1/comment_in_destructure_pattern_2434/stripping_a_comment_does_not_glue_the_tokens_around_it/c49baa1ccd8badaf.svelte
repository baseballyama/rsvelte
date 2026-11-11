<script>
  let { c: [d], e = typeof/*x*/window } = { c: [2] };
  function inc() { d++; }
</script>
<button onclick={inc}>{d}</button>
