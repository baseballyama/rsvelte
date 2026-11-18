<svelte:options namespace="svg" />

<script>
	let r = $state(5);
</script>

<circle cx="10" cy="10" {r} />
<g transform="translate(1, 2)">
	<rect width={r * 2} height={r} rx="1" />
</g>
