<script>
	export let v;
	let k;
	$: k = typeof /[//]/.exec(String(v));
</script>

<p>{k}</p>
