import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";

export default function InlineEditorsDisabled($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { allData: data, countries, users } = getData();
		const isBlocked = (row, column) => row.id === 2 && column.id === "firstName" || row.id === 3 && ["date", "user"].indexOf(column.id) > -1;

		const editorHandler = (config) => {
			return (row, column) => {
				if (!row || !isBlocked(row, column)) return config;
			};
		};

		const columns = [
			{ id: "id", width: 50 },
			{
				id: "firstName",
				header: 'Name - "text"',
				editor: editorHandler("text"),
				width: 180
			},

			{
				id: "country",
				header: 'Country - "combo"',
				editor: editorHandler({
					type: "combo",
					config: { template: (option) => `${option.id}. ${option.label}` }
				}),
				options: countries,
				width: 180
			},

			{
				id: "date",
				header: 'Date - "datepicker"',
				width: 180,
				editor: editorHandler("datepicker"),
				template: (v) => v ? v.toLocaleDateString() : ""
			},

			{
				id: "user",
				header: 'User - "richselect"',
				width: 180,
				editor: editorHandler("richselect"),
				options: users
			}
		];

		$$renderer.push(`<div style="padding: 20px;"><h4>Editable cells: some cells in the second and third rows are not editable</h4> <div>`);

		Grid($$renderer, {
			data,
			columns,
			cellStyle: (row, column) => isBlocked(row, column) ? "blocked" : ""
		});

		$$renderer.push(`<!----></div></div>`);
	});
}