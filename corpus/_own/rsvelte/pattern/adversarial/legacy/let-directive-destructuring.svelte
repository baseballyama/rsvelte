<script>
	import Table from './Table.svelte';

	export let rows = [{ id: 1, tags: ['a', 'b'], meta: { n: 1 } }];
</script>

<Table {rows}>
	<svelte:fragment slot="head" let:cols={{ first, second: renamed }}>
		<th>{first}</th>
		<th>{renamed}</th>
	</svelte:fragment>

	<tr slot="row" let:row={{ id, tags: [head = 'none', ...tail], meta: { n } = {} }} let:index>
		<td>{index}: {id}</td>
		<td>{head} / {tail.length} / {n}</td>
	</tr>

	<svelte:fragment slot="foot" let:totals={[sum, [avg] = []]}>
		<td>{sum} {avg}</td>
	</svelte:fragment>
</Table>
