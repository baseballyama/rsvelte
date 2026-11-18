<script>
  let pos = $state('center');
  const cls = $derived({ center: 'a', left: 'b' }[pos] ?? 'c');
</script>
<div>{cls}</div>