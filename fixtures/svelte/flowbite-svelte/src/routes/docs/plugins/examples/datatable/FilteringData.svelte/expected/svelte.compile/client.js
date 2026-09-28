import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table } from "@flowbite-svelte-plugins/datatable";
import products from "./data/products.json";

export default function FilteringData($$anchor) {
	const filterOptions = {
		tableRender: (_data, table, type) => {
			if (type === "print") {
				return table;
			}

			const tHead = table.childNodes[0];

			const filterHeaders = {
				nodeName: "TR",
				attributes: { class: "search-filtering-row" },
				childNodes: tHead.childNodes[0].childNodes.map((_th, index) => ({
					nodeName: "TH",
					childNodes: [
						{
							nodeName: "INPUT",
							attributes: {
								class: "datatable-input",
								type: "search",
								placeholder: `Filter column ${index + 1}`,
								"data-columns": `[${index}]`
							}
						}
					]
				}))
			};

			tHead.childNodes.push(filterHeaders);

			return table;
		}
	};

	Table($$anchor, {
		get items() {
			return products;
		},

		get dataTableOptions() {
			return filterOptions;
		}
	});
}