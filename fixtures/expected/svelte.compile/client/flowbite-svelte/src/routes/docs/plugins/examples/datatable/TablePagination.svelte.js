import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table } from "@flowbite-svelte-plugins/datatable";
import aimodels from "./data/aimodels.json";

export default function TablePagination($$anchor) {
	const paginationOptions = {
		paging: true,
		perPage: 5,
		perPageSelect: [5, 10, 15, 20, 25],
		sortable: false
	};

	Table($$anchor, {
		get items() {
			return aimodels;
		},

		get dataTableOptions() {
			return paginationOptions;
		}
	});
}