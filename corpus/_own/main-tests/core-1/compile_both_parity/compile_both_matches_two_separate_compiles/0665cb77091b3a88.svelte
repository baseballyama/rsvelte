<script>
  let total = $state(0);
  const handler = (e) => { const bar = e; total = bar; };
</script>
<input oninput={handler} />
{total}