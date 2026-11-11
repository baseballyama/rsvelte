<script>
	export let a = 1;
	let d = 0;
	let e = 0;
	$: try {
		d = a;
	} catch (e) {
		d = e ? 1 : 0;
	}
	$: e = d + 1;
</script>

<b>{d}{e}</b>
