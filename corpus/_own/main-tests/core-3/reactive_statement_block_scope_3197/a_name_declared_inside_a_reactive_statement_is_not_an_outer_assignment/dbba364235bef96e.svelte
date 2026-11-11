<script>
	export let a = 1;
	let d = 0;
	let g = 0;
	$: for (const g of [a]) { d = g; }
	$: g = d + 1;
</script>
<b>{d}{g}</b>
