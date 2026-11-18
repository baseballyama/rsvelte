<script>
	let arr = [], p, c;
</script>
{#each arr as _}{#await p}w{:then v}{v}{:catch e}{e}{/await}{/each}