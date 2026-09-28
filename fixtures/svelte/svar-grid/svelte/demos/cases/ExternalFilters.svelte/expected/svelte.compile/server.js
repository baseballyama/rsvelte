import * as $ from 'svelte/internal/server';
import { Field, DateRangePicker, Text } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData } from "../data";

export default function ExternalFilters($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { allData } = getData();

		const columns = [
			{ id: "id", width: 50 },
			{ id: "firstName", header: "First Name", footer: "First Name" },
			{ id: "lastName", header: "Last Name", footer: "Last Name" },
			{
				id: "date",
				header: "Date",
				template: (v) => v.toDateString(),
				width: 160
			},
			{ id: "companyName", header: "Company", flexgrow: 1 }
		];

		let tableApi = void 0;
		let dateValue = void 0;
		let companyValue = "";

		function init(api) {
			tableApi = api;
		}

		function handleFilter() {
			const filterValues = { date: dateValue, companyName: companyValue };
			const filter = createFilter(filterValues);

			tableApi.exec("filter-rows", { filter });
		}

		function createFilter(filterValues) {
			const filters = Object.keys(filterValues).filter((key) => filterValues[key]).map((key) => {
				const value = filterValues[key];

				switch (key) {
					case "companyName":
						{
							return (v) => {
								if (v[key]) return v[key].toLowerCase().indexOf(value.toLowerCase()) !== -1;
							};
						}

					case "date":
						{
							return (v) => {
								if (v[key]) return isDateInRange(v[key], value);
							};
						}
				}
			});

			return (obj) => {
				for (let i = 0; i < filters.length; i++) {
					if (!filters[i](obj)) {
						return false;
					}
				}

				return true;
			};
		}

		function isDateInRange(date, range) {
			const { start, end } = range;
			const nDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

			return nDate >= start && nDate <= end;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="demo" style="padding: 20px;"><h4>Grid with external filters</h4> <div style="max-width:810px"><div class="controls svelte-bvxjbr">`);

			Field($$renderer, {
				label: 'Filter "Date" column',
				children: ($$renderer) => {
					DateRangePicker($$renderer, {
						clear: true,
						onchange: handleFilter,
						get value() {
							return dateValue;
						},

						set value($$value) {
							dateValue = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Filter "Company" column',
				children: ($$renderer) => {
					Text($$renderer, {
						clear: true,
						icon: "wxi-search",
						onchange: handleFilter,
						get value() {
							return companyValue;
						},

						set value($$value) {
							companyValue = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div style="height: 400px;">`);
			Grid($$renderer, { data: allData, columns, init });
			$$renderer.push(`<!----></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}