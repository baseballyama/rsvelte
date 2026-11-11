<script>
	let p = Promise.resolve(1);
	let k = 1;
</script>

{#snippet row(v)}
	{[v]}
{/snippet}
{@render row(k)}
{#await p then value}
	{{ value }}
{/await}
{#key k}
	{() => k}
{/key}
