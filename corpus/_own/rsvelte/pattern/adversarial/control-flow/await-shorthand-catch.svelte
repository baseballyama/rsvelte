<script>
	let p = $state(Promise.resolve(1));
</script>

{#await p then v}
	<p>{v}</p>
{/await}

{#await p catch e}
	<p>{e}</p>
{/await}

{#await p}
	<p>…</p>
{:then v}
	<span>{v}</span>
{:catch e}
	<span>{e}</span>
{/await}
