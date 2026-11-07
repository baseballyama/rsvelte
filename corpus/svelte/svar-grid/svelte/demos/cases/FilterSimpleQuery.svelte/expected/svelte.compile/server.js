import * as $ from 'svelte/internal/server';
import { getOptions } from "wx-query-store";
import { Query, createArrayFilter } from "wx-svelte-query";
import { getData } from "../data";
import { Grid } from "../../src/";

export default function FilterSimpleQuery($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, columns } = getData();

		let options = {
			city: getOptions(data, "city"),
			firstName: getOptions(data, "firstName"),
			lastName: getOptions(data, "lastName"),
			email: getOptions(data, "email")
		};

		let fields = [
			{ id: "city", name: "City" },
			{ id: "firstName", name: "Name" },
			{ id: "lastName", name: "Last Name" },
			{ id: "email", name: "Email" }
		];

		let filteredData = data;

		function applyFilter(value) {
			filteredData = createArrayFilter(value)(data);
		}

		$$renderer.push(`<div style="padding: 20px;"><div><div class="query svelte-u9y4qt">`);

		Query($$renderer, {
			type: "simple",
			fields,
			options,
			onchange: (ev) => applyFilter(ev.value)
		});

		$$renderer.push(`<!----></div> `);
		Grid($$renderer, { data: filteredData, columns });
		$$renderer.push(`<!----></div></div>`);
	});
}