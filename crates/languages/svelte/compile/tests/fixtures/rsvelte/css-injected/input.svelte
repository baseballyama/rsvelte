<svelte:options css="injected" />
<script>
	let { children } = $props();
	let x = $state(1);
</script>
<p class="a" onclick={() => x++}>{x}</p>
{@render children?.()}
<style>
	.a { color: red; }
	p:hover { color: blue }
	.unused { color: green }
</style>
