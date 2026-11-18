<script>
	let p = Promise.resolve(1);
</script>

{#await p then v }
	{v}
{/await}

{#await p catch e}
	{e}
{/await }

{#await p}
	pending
{:then}
	done
{/await}
