<script>
	export let a = 1;
	$: doubled = a * 2; // trailing
</script>

<p>{doubled}</p>