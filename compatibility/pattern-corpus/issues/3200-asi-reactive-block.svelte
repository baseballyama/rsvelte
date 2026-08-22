<script>
	export let a = 1;
	let d = 0;
	$: {
		d = a d += 1
	}
</script>

<b>{d}</b>
