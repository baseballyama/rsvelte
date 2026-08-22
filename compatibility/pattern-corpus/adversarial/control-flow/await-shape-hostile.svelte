<script>
	let p = $state(Promise.resolve({ v: 1 }));
	let q = $state(Promise.reject(new Error('e')).catch(() => 0));

	async function reload() {
		p = Promise.resolve({ v: Math.trunc(1) });
	}
</script>

{#await p}
	<i>loading</i>
{:then { v }}
	<b>{v}</b>
{:catch { message }}
	<s>{message}</s>
{/await}

{#await q then value}<u>{value}</u>{/await}
{#await q catch e}<u>{String(e)}</u>{/await}
{#await Promise.all([p, q])}
	<i>both</i>
{:then [a, b]}
	<em>{a.v}{b}</em>
{/await}

{#await p then { v2 }}
	<code>{v2}</code>
{/await}

<button onclick={reload}>go</button>
