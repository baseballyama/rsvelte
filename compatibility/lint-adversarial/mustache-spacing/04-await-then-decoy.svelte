<script>
	let p = Promise.resolve(1);
	let q = 'a';
</script>

{#await p}
	{q === "{ :then }" ? 'x' : 'y'}
{:then v }
	{v}
{:catch e}
	{e}
{/await}
