<script>
	export let light;

	$: if (light) light.name = "a";
	$: if (light) light.name = "b";
</script>
