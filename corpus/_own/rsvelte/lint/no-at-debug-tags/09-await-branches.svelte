<script>
	let p = Promise.resolve(1);
	let v = 0;
	let e = null;
</script>

{#await p}
	{@debug v}
{:then value}
	{@debug value}
{:catch err}
	{@debug err, e}
{/await}
