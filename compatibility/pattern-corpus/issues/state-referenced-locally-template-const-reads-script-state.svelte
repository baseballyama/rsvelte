<script>
	let items = $state([1, 2]);
	let count = $state(0);
	let doubled = $derived(count * 2);
	let { label } = $props();
</script>

<div>
	{const total = items.length * 2}
	{const next = count + doubled}
	{const text = label}
	<p>{total} {next} {text}</p>
</div>

{let a = $state(0), b = a}
{let c = $state([1]), d = c}
{let e = $state(0), f = $state(e), g = $state([e])}
{let h = $state(0), i = $derived(h), j = { h: 1 }, k = items.h}
{let m = $state(0)}
{const n = m}
{#if count}
	{const o = m}
	<p>{b} {d} {f} {g} {i} {j} {k} {n} {o}</p>
{/if}
