<script>
	export let config;
	let { retries } = config;
	$: if (retries < 3)
		setTimeout(() => {
			retries = retries + 1;
		});
</script>

{retries}
