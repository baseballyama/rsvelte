<script>
	const { n } = $props();
	const c = $derived(n > 3 ? 1 : 1);
</script>

<div title={c}></div>
