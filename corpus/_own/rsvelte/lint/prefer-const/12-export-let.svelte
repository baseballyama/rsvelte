<script>
	export let prop;
	export let assignedProp;
	function reset() {
		assignedProp = null;
	}
	void reset;
</script>
<p>{prop}{assignedProp}</p>
