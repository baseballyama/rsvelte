<script>
	const { n } = $props();
	const c = $derived(n > 3 ? 0 : '0');
</script>

<div title={c}></div>
