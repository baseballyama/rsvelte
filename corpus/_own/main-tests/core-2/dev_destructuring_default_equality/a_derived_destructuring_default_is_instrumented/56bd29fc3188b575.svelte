<script>
	const props = $props();
	const { target = typeof window === 'undefined' ? undefined : document.body } = $derived(props);
</script>

{target}
