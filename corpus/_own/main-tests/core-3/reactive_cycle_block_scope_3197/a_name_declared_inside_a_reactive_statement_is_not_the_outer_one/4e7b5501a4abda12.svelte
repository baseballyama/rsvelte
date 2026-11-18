<script>
	export let a = 1;
	let d = 0;
	let e = 0;
	$: for (const e of [a]) { d = e; }
	$: e = d + 1;
</script>

<b>{d}{e}</b>
