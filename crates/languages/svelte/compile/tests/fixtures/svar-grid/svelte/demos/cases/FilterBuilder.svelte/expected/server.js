import * as $ from 'svelte/internal/server';
import { FilterBuilder, createFilter, getOptions } from "@svar-ui/svelte-filter";
import { getData } from "../data";
import { Grid } from "../../src";

export default function FilterBuilder_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, columns } = getData();

		columns.push({ id: "comments", flexgrow: 1, header: "Comments" });

		const value = {
			glue: "or",
			rules: [
				{ field: "city", filter: "equal", value: "Eulaliabury" },
				{ field: "city", filter: "equal", value: "West Meda" }
			]
		};

		let api = void 0;

		let options = {
			city: getOptions(data, "city"),
			firstName: getOptions(data, "firstName"),
			lastName: getOptions(data, "lastName"),
			email: getOptions(data, "email")
		};

		let fields = [
			{ id: "city", label: "City", type: "text" },
			{ id: "firstName", label: "Name", type: "text" },
			{ id: "lastName", label: "Last Name", type: "text" },
			{ id: "email", label: "Email", type: "text" }
		];

		function applyFilter({ value }) {
			const filter = createFilter(value);

			api.exec("filter-rows", { filter });
		}

		$$renderer.push(`<div style="padding: 20px;"><h4>Filter grid data executing "filter-rows" action</h4> `);
		FilterBuilder($$renderer, { value, fields, options, type: "line", onchange: applyFilter });
		$$renderer.push(`<!----> `);
		Grid($$renderer, { data, columns });
		$$renderer.push(`<!----></div>`);
	});
}