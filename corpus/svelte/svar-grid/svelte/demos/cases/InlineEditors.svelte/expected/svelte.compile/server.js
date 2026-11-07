import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";

export default function InlineEditors($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { allData: data, countries, users } = getData();

		const columns = [
			{ id: "id", width: 50 },
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
			},

			{
				id: "destinations",
				header: 'Destinations - "multiselect"',
				editor: { type: "multiselect", config: { clear: true } },
				options: countries,
				width: 250
			},

			{
				id: "stars",
				header: 'Stars - "text" (number)',
				editor: { type: "text", config: { type: "number" } },
				width: 250
			}
		];

		$$renderer.push(`<div style="padding: 20px;"><h4>Editable cells: use double click to activate an editor. Use Tab, Enter
		and Esc to navigate</h4> <div>`);

		Grid($$renderer, { data, columns });
		$$renderer.push(`<!----></div></div>`);
	});
}