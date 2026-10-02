import * as $ from 'svelte/internal/server';
import Button from "carbon-components-svelte/Button/Button.svelte";
import DataTable from "carbon-components-svelte/DataTable/DataTable.svelte";
import FilterRowsCaller from "./FilterRowsCaller.svelte";

export default function DataTableRefilterOnRowsChange_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const initialRows = Array.from({ length: 10 }).map((_, i) => ({
			id: i,
			name: `Load Balancer ${i + 1}`,
			rule: i % 2 ? "Round robin" : "DNS delegation"
		}));

		const toggledRows = Array.from({ length: 4 }).map((_, i) => ({
			id: i,
			name: `Server instance ${i + 1}`,
			rule: i % 2 ? "Round!" : "DNS!"
		}));

		let rows = initialRows;

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Toggle rows`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		DataTable($$renderer, {
			headers: [
				{ key: "name", value: "Name" },
				{ key: "rule", value: "Rule" }
			],
			rows,
			children: ($$renderer) => {
				FilterRowsCaller($$renderer, { searchValue: 'round' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}