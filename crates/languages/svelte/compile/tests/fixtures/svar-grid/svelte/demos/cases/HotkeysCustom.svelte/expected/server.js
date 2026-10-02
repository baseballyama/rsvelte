import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";

export default function HotkeysCustom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { allData: data, countries, users } = getData();
		let api = void 0;

		const hotkeys = {
			"ctrl+alt+n": (event) => {
				event.preventDefault();
				api.exec("add-row", { row: {} });
			},

			Delete: (event) => {
				event.preventDefault();

				const id = api.getState().selectedRows[0];

				if (id) {
					api.exec("delete-row", { id });
				}
			}
		};

		const columns = [
			{
				id: "firstName",
				header: 'Name - "text"',
				editor: "text",
				width: 180
			},

			{
				id: "country",
				header: 'Country - "combo"',
				editor: {
					type: "combo",
					config: { template: (option) => `${option.id}. ${option.label}` }
				},
				options: countries,
				width: 180
			},

			{
				id: "date",
				header: 'Date - "datepicker"',
				width: 180,
				editor: "datepicker",
				template: (v) => v ? v.toLocaleDateString() : ""
			},

			{
				id: "user",
				header: 'User - "richselect"',
				width: 180,
				editor: "richselect",
				options: users
			}
		];

		$$renderer.push(`<div style="padding: 20px;"><h4>You can specify your own hotkeys</h4> <p>Press ctrl+alt+n to add row, select and press Delete to delete row</p> <div>`);
		Grid($$renderer, { data, columns, hotkeys });
		$$renderer.push(`<!----></div></div>`);
	});
}