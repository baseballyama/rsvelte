<script>
	let arr = [], p, c;
</script>
{#snippet s()}{#await p}w{:then v}{v}{:catch e}{e}{/await}{/snippet}