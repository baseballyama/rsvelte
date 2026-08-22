<script>
	import Table from './Table.svelte';

	export let rows = [{ id: 1, tags: ['a', 'b'], meta: { n: 1 } }];
</script>

<Table {rows}>
	<tr slot="row" let:row={{ id, tags: [head = 'none', ...tail], meta: { n } = {} }} let:index>
		<td>{index}: {id}</td>
		<td>{head} / {tail.length} / {n}</td>
	</tr>

	<svelte:fragment slot="head" let:cols={[first = 'x', [second] = []]}>
		<th>{first}</th>
		<th>{second}</th>
	</svelte:fragment>
</Table>
