import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid, Toolbar } from "../../src";

export default function Toolbar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, countries } = getData();
		let api = void 0;

		const columns = [
			{ id: "id", width: 50 },
			{
				id: "firstName",
				header: "First Name",
				editor: "text",
				width: 160
			},

			{
				id: "lastName",
				header: "Last Name",
				editor: "text",
				width: 160
			},

			{
				id: "country",
				header: "Country",
				editor: "richselect",
				options: countries,
				width: 160
			},

			{
				id: "date",
				header: "Date",
				width: 100,
				template: (v) => v ? v.toLocaleDateString() : ""
			},
			{ id: "companyName", header: "Description", flexgrow: 1 }
		];

		$$renderer.push(`<div style="padding: 20px;">`);
		Toolbar($$renderer, { api });
		$$renderer.push(`<!----> `);
		Grid($$renderer, { data, columns, reorder: true, undo: true, multiselect: true });
		$$renderer.push(`<!----></div>`);
	});
}