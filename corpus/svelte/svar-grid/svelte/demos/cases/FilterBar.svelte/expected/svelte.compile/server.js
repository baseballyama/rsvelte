import * as $ from 'svelte/internal/server';
import { Tabs } from "@svar-ui/svelte-core";
import { FilterBar, createFilter, getOptions } from "@svar-ui/svelte-filter";
import { Grid } from "../../src";
import { getData } from "../data";

export default function FilterBar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, columns } = getData();
		let api = void 0;
		let filterId = 1;

		const filterTabs = [
			{ id: 1, label: "By all" },
			{ id: 2, label: "By city" },
			{ id: 3, label: "By the field" }
		];

		const cities = getOptions(data, "city");

		function handleValueChange({ value }) {
			const filter = createFilter(value);

			api.exec("filter-rows", { filter });
		}

		function handleFilterChange({ value }) {
			filterId = value;
			api.exec("filter-rows", { filter: null });
		}

		$$renderer.push(`<div style="padding: 20px;"><h4>Filter grid data executing "filter-rows" action</h4> `);

		Tabs($$renderer, {
			value: filterId,
			options: filterTabs,
			onchange: handleFilterChange
		});

		$$renderer.push(`<!----> `);

		if (filterId === 1) {
			$$renderer.push('<!--[0-->');

			FilterBar($$renderer, {
				fields: [
					{
						type: "all",
						by: ["id", "city", "firstName", "lastName", "email"]
					}
				],
				onchange: handleValueChange
			});
		} else if (filterId === 2) {
			$$renderer.push('<!--[1-->');

			FilterBar($$renderer, {
				fields: [{ type: "text", id: "city", options: cities }],
				onchange: handleValueChange
			});
		} else if (filterId === 3) {
			$$renderer.push('<!--[2-->');

			FilterBar($$renderer, {
				fields: [
					{
						type: "dynamic",
						by: ["city", "firstName", "lastName", "email"]
					}
				],
				onchange: handleValueChange
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		Grid($$renderer, { data, columns });
		$$renderer.push(`<!----></div>`);
	});
}