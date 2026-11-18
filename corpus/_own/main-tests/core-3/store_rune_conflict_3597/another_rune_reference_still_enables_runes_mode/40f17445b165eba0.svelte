<script>
	let v = $state(1);
	const state = { x: 1 };
	let d = $derived(v);
</script>

<b>{typeof v}{typeof d}</b>
