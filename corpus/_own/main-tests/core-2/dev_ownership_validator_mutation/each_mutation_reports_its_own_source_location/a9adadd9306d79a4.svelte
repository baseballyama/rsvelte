<script>
	let { listEl } = $props();
	function open() {
		listEl.style.overflow = "hidden";
	}
	function close() {
		listEl.style.overflow = "";
	}
</script>
