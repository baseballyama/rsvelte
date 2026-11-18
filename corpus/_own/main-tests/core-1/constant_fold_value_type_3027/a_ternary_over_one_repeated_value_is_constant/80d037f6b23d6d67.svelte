<script>
	const { n } = $props();
	const c = $derived(n > 3 ? undefined : undefined);
</script>

<div title={c}></div>
