<script>
	let x = $state(1);
	async function f() {
		/* c */ await load();
	}
</script>
<p>{x}{f}</p>