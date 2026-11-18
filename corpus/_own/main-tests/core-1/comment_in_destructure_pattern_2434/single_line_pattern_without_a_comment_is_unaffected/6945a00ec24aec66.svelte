<script>
  let { c: [d] } = { c: [2] };
  function inc() { d++; }
</script>
<button onclick={inc}>{d}</button>
