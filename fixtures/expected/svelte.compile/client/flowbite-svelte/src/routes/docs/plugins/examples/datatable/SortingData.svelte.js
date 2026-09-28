import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table } from "@flowbite-svelte-plugins/datatable";
import items from "./data/gdp.json";

export default function SortingData($$anchor) {
	const dataTableOptions = { searchable: false, perPageSelect: false, sortable: true };

	Table($$anchor, {
		get items() {
			return items;
		},

		get dataTableOptions() {
			return dataTableOptions;
		}
	});
}