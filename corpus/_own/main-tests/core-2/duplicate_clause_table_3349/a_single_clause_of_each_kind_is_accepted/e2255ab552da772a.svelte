<script>
	let arr = [], p, c;
</script>
{#if c}{#await p}w{:then v}{v}{:catch e}{e}{/await}{/if}