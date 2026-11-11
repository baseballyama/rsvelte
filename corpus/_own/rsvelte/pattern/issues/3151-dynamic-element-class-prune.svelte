<script>
	let n = $state(1);
</script>

<style>
	.x { color: red }
	.a { color: green }
	.b { color: blue }
</style>

<svelte:element this={'div'} class={n ? 'a' : 'b'}>unquoted</svelte:element>
<svelte:element this={'div'} class="{n ? 'a' : 'b'}">quoted</svelte:element>
