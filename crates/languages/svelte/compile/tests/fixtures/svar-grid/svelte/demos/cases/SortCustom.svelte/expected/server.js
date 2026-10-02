import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";
import { Button } from "@svar-ui/svelte-core";

export default function SortCustom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = getData();
		let api = void 0;

		const columnsCustomSort = [
			{ id: "id", width: 50, sort: true },
			{ id: "city", header: "City", width: 160, sort: true },
			{
				id: "street",
				header: "Street",
				width: 200,
				sort: (a, b) => {
					return a.zipCode.localeCompare(b.zipCode);
				},
				template: (value, row) => `${row.street}, ${row.zipCode}`
			},
			{ id: "firstName", header: "First Name", sort: true },
			{ id: "lastName", header: "Last Name", sort: true }
		];

		const columnsSort = [
			{ id: "id", width: 50, sort: false },
			{ id: "city", header: "City", width: 160, sort: true },
			{ id: "firstName", header: "First Name", sort: true },
			{ id: "lastName", header: "Last Name", sort: true }
		];

		let sortMarks = void 0;

		function onclick() {
			sortMarks = {
				lastName: { order: sortMarks?.lastName?.order === "asc" ? "desc" : "asc" }
			};

			api.exec("sort-rows", {
				sort: (a, b) => {
					return sortMarks?.lastName?.order === "asc"
						? a.lastName.localeCompare(b.lastName)
						: -a.lastName.localeCompare(b.lastName);
				}
			});
		}

		$$renderer.push(`<div class="demo-container svelte-ygh8xg"><div><h4>Custom sorting function can be specified in columns config</h4> `);
		Grid($$renderer, { data, columns: columnsCustomSort });
		$$renderer.push(`<!----></div> <div><h4>Sorting via sort-rows action call</h4> `);

		Button($$renderer, {
			onclick,
			css: 'demo-button-sort',
			type: 'primary',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click to sort by last name`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		Grid($$renderer, { data, sortMarks, columns: columnsSort });
		$$renderer.push(`<!----></div></div>`);
	});
}