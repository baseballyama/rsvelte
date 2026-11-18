<script>
	const { n } = $props();
	const c = $derived(n > 3 ? null : null);
</script>

<div title={c}></div>
