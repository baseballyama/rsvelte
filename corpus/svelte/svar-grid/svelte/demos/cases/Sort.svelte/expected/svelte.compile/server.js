import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";

export default function Sort($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = getData();

		const columns = [
			{ id: "id", width: 50, sort: true },
			{ id: "city", header: "City", width: 160, sort: true },
			{ id: "email", header: "Email", width: 250, sort: true },
			{ id: "firstName", header: "First Name", sort: true },
			{ id: "lastName", header: "Last Name", sort: true }
		];

		const columnsSortOnUpdate = [
			{ id: "id", width: 50, sort: true },
			{
				id: "city",
				header: "City",
				width: 160,
				sort: true,
				editor: "text"
			},

			{
				id: "firstName",
				header: "First Name",
				sort: true,
				editor: "text"
			},

			{
				id: "lastName",
				header: "Last Name",
				sort: true,
				editor: "text"
			}
		];

		function init(api) {
			api.on("update-cell", () => {
				const marks = api.getState().sortMarks;

				for (let key in marks) {
					api.exec("sort-rows", { key, order: marks[key].order, add: marks[key].index ?? true });
				}
			});
		}

		$$renderer.push(`<div class="demo-container svelte-1utfudl"><div><h4>Click on header cells to sort the data</h4> `);
		Grid($$renderer, { data, columns });
		$$renderer.push(`<!----></div> <div><h4>Resort data after editing a cell</h4> `);
		Grid($$renderer, { data, init, columns: columnsSortOnUpdate });
		$$renderer.push(`<!----></div></div>`);
	});
}