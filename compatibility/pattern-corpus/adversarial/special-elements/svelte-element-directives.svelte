<script>
	let tag = $state('div');
	let el = $state(null);
	let on = $state(true);
	let value = $state('');

	function act(node) {
		node.dataset.a = '1';
	}
</script>

<svelte:element
	this={tag}
	bind:this={el}
	class:on
	style:color="red"
	use:act
	onclick={() => (on = !on)}
	data-tag={tag}
>
	{tag}
</svelte:element>

<svelte:element this={on ? 'section' : 'article'}>{value}</svelte:element>

<p>{el?.tagName ?? '-'} {value}</p>

<style>
	.on {
		font-weight: bold;
	}
</style>
