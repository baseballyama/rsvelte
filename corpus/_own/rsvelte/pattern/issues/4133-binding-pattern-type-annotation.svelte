<script lang="ts">
	let items: string[] = ['a', 'b'];
	let boxes: { w: number }[] = [{ w: 1 }];
	let caught = '';

	function load() {
		try {
			JSON.parse('{');
		} catch (error: unknown) {
			caught = String(error);
		}
		try {
			JSON.parse('[');
		} catch ({ message }: Error) {
			caught = message;
		}
	}
	load();
</script>

{#each items as item: string, i}
	<span>{i}: {item}</span>
{/each}

{#each boxes as box}
	{@const area: number = box.w * 2}
	{@const label: string = `${area}`}
	<p>{area} {label}</p>
{/each}

{#await Promise.resolve('x') then value: string}
	<b>{value}</b>
{:catch error: unknown}
	<i>{String(error)}</i>
{/await}

<p>{caught}</p>
