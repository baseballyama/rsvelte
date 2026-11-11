<svelte:options css="injected" />

<div class="a"><b class="b">b</b></div>

<style>
	.a {
		color: red;
		& .b { color: blue }
	}
</style>
