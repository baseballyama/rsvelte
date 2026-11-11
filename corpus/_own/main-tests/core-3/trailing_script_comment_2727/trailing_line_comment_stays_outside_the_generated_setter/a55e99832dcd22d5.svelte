<script>
	export let v;
	let k;
	$: k = typeof /[//]/.exec(String(v));
	// } c
</script><p>{k}</p>