<script>
	let n = $state(1);
</script>

<style>
	.x { color: red }
	div { color: blue }
</style>

<svelte:element this={'div'} id="x">a</svelte:element>
<svelte:element this={'span'} {...{ role: 'note' }}>b</svelte:element>
<svelte:element this={'div'} class="k">c</svelte:element>
<div id="y">d</div>
