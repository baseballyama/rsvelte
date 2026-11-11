<script>
	export let a = 1;
	let d = 0;
	$: d = a /* c */ + 1;
	export let p = 0;
</script>
<b>{d}</b>
