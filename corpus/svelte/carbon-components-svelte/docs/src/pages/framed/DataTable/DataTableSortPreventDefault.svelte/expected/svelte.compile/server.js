import * as $ from 'svelte/internal/server';
import { DataTable } from "carbon-components-svelte";

export default function DataTableSortPreventDefault($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DataTable($$renderer, {
				headers: [
					{ key: "name", value: "Name" },
					{ key: "port", value: "Port" }
				],
				rows,
				sortable: true,
				get sortKey() {
					return sortKey;
				},

				set sortKey($$value) {
					sortKey = $$value;
					$$settled = false;
				},

				get sortDirection() {
					return sortDirection;
				},

				set sortDirection($$value) {
					sortDirection = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}