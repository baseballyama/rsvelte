<script>
	const { n } = $props();
	const c = $derived(n > 3 ? true : 'true');
</script>

<div title={c}></div>
