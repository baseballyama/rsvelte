import type DataTable from '$libs/components/data-table.svelte';

interface Row {
	id: string;
}

export class Store {
	public table: DataTable<Row> | null = null;
}
