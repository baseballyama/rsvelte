import * as $ from 'svelte/internal/server';
import { FilterBuilder, createArrayFilter, getOptions } from "@svar-ui/svelte-filter";
import { getData } from "../data";
import { Grid } from "../../src";

export default function FilterSimpleFilterBuilder($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, columns } = getData();

		let options = {
			city: getOptions(data, "city"),
			firstName: getOptions(data, "firstName"),
			lastName: getOptions(data, "lastName"),
			email: getOptions(data, "email")
		};

		let fields = [
			{ id: "city", label: "City", type: "text" },
			{ id: "firstName", label: "First Name", type: "text" },
			{ id: "lastName", label: "Last Name", type: "text" },
			{ id: "email", label: "Email", type: "text" }
		];

		const value = {
			rules: [{ field: "firstName", filter: "contains", value: "C" }]
		};

		let filteredData = [];

		applyFilter(value);

		function applyFilter(value) {
			filteredData = createArrayFilter(value)(data);
		}

		$$renderer.push(`<div style="padding: 20px;"><h4>Filter data before parsing to Grid</h4> `);

		FilterBuilder($$renderer, {
			value,
			type: "simple",
			fields,
			options,
			onchange: (ev) => applyFilter(ev.value)
		});

		$$renderer.push(`<!----> `);
		Grid($$renderer, { data: filteredData, columns });
		$$renderer.push(`<!----></div>`);
	});
}