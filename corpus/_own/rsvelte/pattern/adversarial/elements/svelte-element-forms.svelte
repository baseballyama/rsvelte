<script>
	let tag = $state('div');
	let level = $state(2);
	let shape = $state('circle');
</script>

<svelte:element this={tag} class="dyn">plain</svelte:element>
<svelte:element this={`h${level}`}>heading</svelte:element>
<svelte:element this={'not-' + tag} data-x={level}>custom-ish</svelte:element>

<svg viewBox="0 0 10 10">
	<svelte:element this={shape} r="4" cx="5" cy="5" />
</svg>

<svelte:element this={undefined}>nothing</svelte:element>

<style>
	.dyn {
		color: red;
	}
</style>
