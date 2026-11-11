<script>
const a = (r) => { r.forEach(({ from }) => from); };
const b = (s) => { const { a: { $from } } = s; return $from; };
</script>