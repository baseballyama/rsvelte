<script>
	let { load, other } = $props();
	let count = $state(0);
</script>

{#await load(count)}
	<p>loading {count}</p>
{:then value}
	<p>{value}</p>
{:catch error}
	<p>{error.message}</p>
{/await}
{#await other then { name, size = 1 }}
	<b>{name} {size}</b>
{/await}
{#await other catch e}
	<i>{e}</i>
{/await}
<div>{#await other}<span>wait</span>{/await}</div>
