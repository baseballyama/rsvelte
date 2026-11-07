import * as $ from 'svelte/internal/server';
import { Table } from "@flowbite-svelte-plugins/datatable";
import aimodels from "./data/aimodels.json";

export default function TablePagination($$renderer) {
	const paginationOptions = {
		paging: true,
		perPage: 5,
		perPageSelect: [5, 10, 15, 20, 25],
		sortable: false
	};

	Table($$renderer, { items: aimodels, dataTableOptions: paginationOptions });
}