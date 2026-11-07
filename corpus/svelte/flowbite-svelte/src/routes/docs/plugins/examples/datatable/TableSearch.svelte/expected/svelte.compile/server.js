import * as $ from 'svelte/internal/server';
import { Table } from "@flowbite-svelte-plugins/datatable";
import items from "./data/stock.json";

export default function TableSearch($$renderer) {
	Table($$renderer, {
		items,
		dataTableOptions: { searchable: false, sortable: false }
	});
}