<svelte:options css="injected" />

<script>
	let tone = $state('warm');
</script>

<p class={tone}>styled</p>

<style>
	.warm {
		color: orange;
	}

	p {
		margin: 0;
	}
</style>
