<script>
	const is_dev = import.meta.env.DEV;

	function ctor() {
		return new.target;
	}
</script>

<svelte:head>
	<meta name="description" content={is_dev ? 'dev' : ctor.name} />
</svelte:head>
