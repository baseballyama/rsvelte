<script>
	export let a = 1;
	let d = 0;
	let g = 0;
	$: switch (a) { case 1: let g = 2; d = g; }
	$: g = d + 1;
</script>
<b>{d}{g}</b>
