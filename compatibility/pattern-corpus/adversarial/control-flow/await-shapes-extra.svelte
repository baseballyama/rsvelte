<script>
	const plain = 1;
	const p = Promise.resolve('a');
	let flag = $state(true);
</script>

{#await plain}
	<span>pending</span>
{:then v}
	<span>{v}</span>
{/await}

{#await p then v}
	<span>{v}</span>
{/await}

{#await p catch e}
	<span>{e}</span>
{/await}

{#await flag ? p : Promise.reject(new Error('x'))}
	<i>…</i>
{:then value}
	<b>{value}</b>
{:catch { message }}
	<u>{message}</u>
{/await}

{#await p}
	<span>only pending</span>
{/await}
