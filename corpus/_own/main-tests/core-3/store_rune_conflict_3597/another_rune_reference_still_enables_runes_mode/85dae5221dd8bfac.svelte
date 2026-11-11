<script>
	let v = $state(1);
	const state = { x: 1 };
</script>

<b onclick={() => { let d = $derived(v); v = d; }}>{typeof v}</b>
