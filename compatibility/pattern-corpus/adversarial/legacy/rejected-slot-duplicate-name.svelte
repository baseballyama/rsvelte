<script>
	let { name = 'x' } = $props();
</script>

<slot name="header" {name} />
