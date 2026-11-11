<script>
	let n = $state(1);
</script>

<style>
	.k { color: red }
	b { color: blue }
	div { color: green }
</style>

<b class="&lt;{n}">entity then expression</b>
<svelte:element this={'div'} class="a&amp;b">ampersand</svelte:element>
<svelte:element this={'div'} class='he said "x"'>quote</svelte:element>
