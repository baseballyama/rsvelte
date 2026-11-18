<script>
	export let a = 1;
	let d = 0;
	let f = 0;
	$: { function f() { return a; } d = f(); }
	$: f = d + 1;
</script>
<b>{d}{f}</b>
