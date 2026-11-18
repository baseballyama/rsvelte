<script>
	export let a = 1;
	let d = 0;
	let e = 0;
	$: { d = e; { let e = 1; d = e; } }
	$: e = d + 1;
</script>

<b>{d}{e}</b>
