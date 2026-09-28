import * as $ from 'svelte/internal/server';
import { Table } from "@flowbite-svelte-plugins/datatable";
import products from "./data/products.json";

export default function FilteringData($$renderer) {
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

	Table($$renderer, { items: products, dataTableOptions: filterOptions });
}