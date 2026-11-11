<script>
	const { n } = $props();
	const c = $derived(n > 3 ? null : undefined);
</script>

<div title={c}></div>
