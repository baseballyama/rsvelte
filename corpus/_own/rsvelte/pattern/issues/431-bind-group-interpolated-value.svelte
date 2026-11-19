<script>
	let { p, q } = $props();
	let group = $state([]);
	let one = $state('');
	let checked = $state(false);
	let items = $state([1, 2]);
	let c = 'q';
	function f(x) {
		return x;
	}
</script>

<input type="checkbox" value="{p}-{q}" bind:group={group} />
<input type="radio" value="x{p}" bind:group={one} />
<input type="radio" value="{f(p)}{q}" bind:group={one} />
<input type="checkbox" value="{p}:{f(q)}" bind:checked={checked} />
{#each items as item, i}
	<input type="checkbox" value="{item}-{i}-{p}" bind:group={group} />
{/each}
<input type="checkbox" value="a{c}" bind:group={group} />
<input type="checkbox" value="it's {c}" bind:group={group} />
<input type="checkbox" value="say &quot;{c}&quot; \ back" bind:group={group} />
<input type="checkbox" value={'lit'} bind:group={group} />
