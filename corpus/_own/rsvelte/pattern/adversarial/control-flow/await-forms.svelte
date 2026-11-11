<script>
	let p = $state(Promise.resolve(1));
	let q = $state(Promise.reject(new Error('x')));
</script>

{#await p}
	<p>loading</p>
{:then value}
	<p>{value}</p>
{:catch err}
	<p>{err.message}</p>
{/await}

{#await p then}
	<p>done, unbound</p>
{/await}

{#await p then [first = 0]}
	<p>{first}</p>
{/await}

{#await q catch { message }}
	<p>{message}</p>
{/await}

{#await Promise.all([p, q.catch(() => 0)]) then [a, b]}
	<p>{a}:{b}</p>
{/await}

{#await p}
	<p>pending only</p>
{/await}
