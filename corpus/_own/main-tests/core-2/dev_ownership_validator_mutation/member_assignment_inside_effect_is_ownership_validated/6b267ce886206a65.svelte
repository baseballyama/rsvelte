<script>
	let { listEl } = $props();
	$effect(() => {
		listEl.style.overflow = "hidden";
	});
</script>
