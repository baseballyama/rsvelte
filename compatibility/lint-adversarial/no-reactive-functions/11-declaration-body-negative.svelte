<script>
	export let count;
	$: void (() => count);
	function shell() {
		return () => count;
	}
	$: latest = shell();
</script>

{latest}
