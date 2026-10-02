import * as $ from 'svelte/internal/server';
import { Table } from "@flowbite-svelte-plugins/datatable";
import items from "./data/simple.json";

export default function Simple($$renderer) {
	const dataTableOptions = {
		perPageSelect: [5, 10, 15, ["All", -1]],
		columns: [
			{ select: 2, sortSequence: ["desc", "asc"] },
			{ select: 3, sortSequence: ["desc"] },
			{ select: 4, cellClass: "green", headerClass: "red" }
		]
	};

	Table($$renderer, { items, dataTableOptions });
}