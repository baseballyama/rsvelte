<script>
	export let light;

	$: if (light) light.matrixAutoUpdate = true;

	function apply() {
		light.intensity = 1;
	}
</script>

<button onclick={apply}>go</button>
