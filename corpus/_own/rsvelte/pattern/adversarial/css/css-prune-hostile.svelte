<script>
	let active = $state(true);
</script>

<div class="wrap">
	{#if active}
		<p class="a b">x</p>
	{/if}
	<svelte:element this={'span'} class="c">y</svelte:element>
	<div class={active ? 'd' : 'e'}>z</div>
	<div class:f={active}>w</div>
</div>

<style>
	.wrap > .a.b {
		color: red;
	}
	.wrap .c ~ div {
		color: blue;
	}
	.wrap :is(.d, .e) {
		color: green;
	}
	.wrap .f:not(.a) {
		color: teal;
	}
	.wrap > * + * {
		margin: 0;
	}
	.wrap .a:global(.injected) {
		padding: 0;
	}
	.nothing-matches {
		display: none;
	}
	.wrap:has(.a) .c {
		outline: 0;
	}
</style>
