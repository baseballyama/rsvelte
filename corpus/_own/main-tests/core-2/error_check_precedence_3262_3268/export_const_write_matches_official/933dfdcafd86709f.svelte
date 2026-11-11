<script>
	let x = $state(1);
	export const a = $derived(x);
</script>
<p>{a}</p>