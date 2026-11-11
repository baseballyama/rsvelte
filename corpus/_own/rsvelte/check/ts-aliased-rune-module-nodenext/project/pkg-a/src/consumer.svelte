<script lang="ts">
	import List from '$lib/anatomy/list.svelte';
	import DataTable from '$libs/components/data-table.svelte';
	import { useProvider } from '$lib/modules/provider.svelte';
	import theme, { tokens } from '$lib/modules/theme.svelte';
	import makeState, { shared } from '$libs/modules/state.svelte';
	import Widget from '$lib/anatomy/widget.svelte';

	const rows = [useProvider()];
</script>

<List {rows} />
<DataTable rows={[{ id: 'a' }]} />
<Widget label="w" />
<p>{theme.name}{tokens.length}{shared.count}{makeState().count}</p>
