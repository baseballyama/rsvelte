<script>
	export let a = 1;
	let d = 0;
	$: d = a /* c */ + 1;
	$: e2 = d + 1;
</script>
<b>{d}{e2}</b>
