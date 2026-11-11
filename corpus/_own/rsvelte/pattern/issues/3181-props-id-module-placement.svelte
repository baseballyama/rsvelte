<script module>
	// A `$props.id`-shaped MEMBER is not the rune, and neither is a local
	// binding that shadows it — both must survive here, where the rune itself
	// is rejected.
	const holder = { $props: { id: () => 'not-the-rune' } };
	const shadowed = holder.$props.id();
</script>

<script>
	const uid = $props.id();
	let { label = 'x' } = $props();
</script>

<label for={uid}>{label}{shadowed}</label>
<input id={uid} />
