<script>
	class DefaultMaterial {}

	let {
		Material = DefaultMaterial,
		materials = { Current: DefaultMaterial }
	} = $props();

	const direct = new Material({ direct: true });
	const member = new materials.Current({ direct: false });
</script>

<p>{direct.constructor.name} {member.constructor.name}</p>
