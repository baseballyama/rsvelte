<script>
	let refs = [];
	let items = [1, 2];

	function go() {
		refs[0].remove();
	}
</script>

{#each items as item, i}
	<div bind:this={refs[i]}>{item}</div>
{/each}
<button on:click={go}>x</button>
