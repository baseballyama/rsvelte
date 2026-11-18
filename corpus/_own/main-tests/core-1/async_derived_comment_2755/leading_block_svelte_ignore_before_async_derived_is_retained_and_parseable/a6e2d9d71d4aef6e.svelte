<script>
/* svelte-ignore await_waterfall */ const value = $derived(await Promise.resolve(1));
</script>
<p>{value}</p>