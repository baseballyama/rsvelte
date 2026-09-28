import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DataTable } from "carbon-components-svelte";

export default function DataTableSortPreventDefault($$anchor, $$props) {
	$.push($$props, true);

	// Mock data from the server.
	const unsortedFromServer = [
		{ id: "1", name: "Charlie", port: 3 },
		{ id: "2", name: "Alpha", port: 1 },
		{ id: "3", name: "Bravo", port: 2 }
	];

	let rows = [...unsortedFromServer];
	let sortKey = null;
	let sortDirection = "none";

	// Simulate fetching data from a remote server.
	function fetchDataFromServer(key, direction) {
		if (direction === "none" || key == null) {
			return [...unsortedFromServer];
		}

		const mul = direction === "ascending" ? 1 : -1;

		return [...unsortedFromServer].sort((a, b) => {
			const va = a[key];
			const vb = b[key];

			if (va === vb) return 0;

			return va < vb ? -mul : mul;
		});
	}

	function fakeServerSort(key, direction) {
		return new Promise((resolve) => {
			setTimeout(() => resolve(fetchDataFromServer(key, direction)), 250);
		});
	}

	DataTable($$anchor, {
		headers: [
			{ key: "name", value: "Name" },
			{ key: "port", value: "Port" }
		],

		get rows() {
			return rows;
		},
		sortable: true,
		get sortKey() {
			return sortKey;
		},

		set sortKey($$value) {
			sortKey = $$value;
		},

		get sortDirection() {
			return sortDirection;
		},

		set sortDirection($$value) {
			sortDirection = $$value;
		},

		$$events: {
			sort: async (e) => {
				e.preventDefault();

				const { key, direction } = e.detail;

				rows = await fakeServerSort(key, direction);
				sortKey = key;
				sortDirection = direction;
			}
		}
	});

	$.pop();
}