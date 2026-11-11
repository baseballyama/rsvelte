<script>
  let { c: [d], e = /\/\// } = { c: [2] };
  function inc() { d++; }
</script>
<button onclick={inc}>{d}</button>
