<script>
	export let a = 1;
	let d = 0;
	let g = 0;
	$: { class g {} d = g ? a : 0; }
	$: g = d + 1;
</script>
<b>{d}{g}</b>
