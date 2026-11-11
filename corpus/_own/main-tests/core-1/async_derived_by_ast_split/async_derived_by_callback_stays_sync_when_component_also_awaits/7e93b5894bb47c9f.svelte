<script>
const value = $derived.by(async () => await load());
const resolved = await load();
</script>
{value}{resolved}