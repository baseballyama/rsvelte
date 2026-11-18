<script>
const a = (r) => { r.forEach(({ from }) => from); };
const b = (state) => { const { $from } = state.selection; return $from; };
</script>