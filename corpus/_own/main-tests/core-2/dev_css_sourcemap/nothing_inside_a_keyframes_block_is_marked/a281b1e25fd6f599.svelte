<svelte:options css="injected" />

<div class="a">a</div>

<style>
	:global {
		@keyframes k { from { opacity: 0 } }
	}
	.a { animation: k 1s }
</style>
