<svelte:options css="injected" />

<div class="a">a</div>

<style>
	.a {
		@keyframes k { from { opacity: 0 } }
		animation: k 1s;
	}
</style>
