<script>
	let n = $state(1);
</script>

<style>
	.b .a { color: red }
	.c > .a { color: green }
	.d .a { color: blue }
</style>

<div class="b"><svelte:boundary><div class="a">descendant</div></svelte:boundary></div>
<div class="c"><svelte:boundary><div class="a">child</div></svelte:boundary></div>
<div class="d">
	<svelte:boundary>
		{#if n}<div class="a">through a block too</div>{/if}
	</svelte:boundary>
</div>
