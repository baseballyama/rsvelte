<script>
	let arr = [], p, c;
</script>
{#if c}{#await p}w{:catch e}{e}{:then v}{v}{/await}{/if}