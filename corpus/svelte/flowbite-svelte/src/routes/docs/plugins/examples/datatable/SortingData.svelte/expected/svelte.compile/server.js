import * as $ from 'svelte/internal/server';
import { Table } from "@flowbite-svelte-plugins/datatable";
import items from "./data/gdp.json";

export default function SortingData($$renderer) {
	const dataTableOptions = { searchable: false, perPageSelect: false, sortable: true };

	Table($$renderer, { items, dataTableOptions });
}