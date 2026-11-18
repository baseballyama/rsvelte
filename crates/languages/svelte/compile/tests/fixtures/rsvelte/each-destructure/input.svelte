<script>
	let { items, pairs, fixed } = $props();
	let fallback = $state('none');
	const plain = [{ name: 'a', tags: ['x'] }];
</script>

{#each items as { id, name, size = 1, ...rest } (id)}
	<p>{id} {name} {size} {rest.extra}</p>
{/each}
{#each pairs as [key, value], i}
	<span>{i}: {key}={value}</span>
{/each}
{#each plain as { name, tags: [first = fallback] }}
	<b>{name} {first}</b>
{/each}
{#each fixed as { label }}
	<i>{label}</i>
{/each}
