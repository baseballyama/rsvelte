<script>
let base = $state(1);
async function go() { $inspect.trace(); return base; }
</script>
{base}
