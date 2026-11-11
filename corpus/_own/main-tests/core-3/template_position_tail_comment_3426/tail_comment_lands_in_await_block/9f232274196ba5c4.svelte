<script>
	export let a = 1;
	let b = a;
	// tail
</script>
{#await b}x{:then v}{v}{/await}
