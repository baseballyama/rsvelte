<script>
	const { n } = $props();
	const c = $derived(n > 3 ? undefined : null);
</script>

<div title={c}></div>
