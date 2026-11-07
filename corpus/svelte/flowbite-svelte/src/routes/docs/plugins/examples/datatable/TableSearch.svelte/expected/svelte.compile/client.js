import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table } from "@flowbite-svelte-plugins/datatable";
import items from "./data/stock.json";

export default function TableSearch($$anchor) {
	Table($$anchor, {
		get items() {
			return items;
		},
		dataTableOptions: { searchable: false, sortable: false }
	});
}