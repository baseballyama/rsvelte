<script>
	function props() {
		return {};
	}
	let { fake } = props();
	let { also } = $props.call(null);
	void [fake, also];
</script>
<p>decoys</p>
