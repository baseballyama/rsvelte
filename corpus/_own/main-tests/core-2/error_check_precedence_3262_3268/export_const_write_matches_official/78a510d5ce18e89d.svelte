<script>
	let x = $state(1);
	const a = $derived(x);
	export { a };
</script>
<p>{a}</p>