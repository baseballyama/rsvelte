<script>
	import Table from './Table.svelte';

	export let rows = [{ id: 1, tags: ['a'], meta: { n: 1 } }];
</script>

<Table {rows}>
	<tr slot="row" let:row={{ id, tags: [(head = 'none'), ...tail], meta: ({ n } = {}) }}>
		<td>{id}: {head} / {tail.length} / {n}</td>
	</tr>
</Table>
