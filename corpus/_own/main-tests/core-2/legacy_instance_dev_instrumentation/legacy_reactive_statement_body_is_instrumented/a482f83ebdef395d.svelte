<script>
	export let a = 1;
	export let b = 2;
	$: e = a !== b;
</script>

<p>{e}</p>