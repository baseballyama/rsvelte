<script>
	let [q] = $state([0]);
	let n = $state(1);
	let pairs = $state([[1], [2]]);
</script>

{let [r] = $state([1])}
{let { s } = $state({ s: 1 })}
{let [x, ...rest] = $state.raw([1, 2, 3])}
{const { d, e: [f] } = $derived({ d: n, e: [2] })}
{const [g] = $derived.by(() => [r])}
{#if n}
	{let [h] = $state([n])}
	{const { k } = $derived({ k: h })}
	<i>{h}{k}</i>
{/if}
{#each pairs as [p]}
	{let [m] = $state([p])}
	<b>{m}</b>
{/each}
<p>{q}{r} {s} {x} {rest} {d} {f} {g}</p>
<button onclick={() => { r = 2; s = 3; }}>x</button>
