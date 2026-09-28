import * as $ from 'svelte/internal/server';
import { getData, repeatColumns } from "../data";
import { Button } from "@svar-ui/svelte-core";
import { Grid } from "../../src/";

export default function Styling($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = getData();
		const columns = repeatColumns(50);
		let cellStyle = void 0;
		let i = 0;

		function setCellStyle() {
			let id = data[i].id;

			cellStyle = (row, col) => row.id == id && col.id == "lastName" ? "cellStyle" : "";
			i = i == data.length - 1 ? 0 : i + 1;
		}

		$$renderer.push(`<div style="padding: 20px;"><p>`);

		Button($$renderer, {
			type: 'primary',
			onclick: () => setCellStyle(),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Set cell style`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></p> <div>`);

		Grid($$renderer, {
			data,
			columns,
			cellStyle,
			rowStyle: (row) => row.id == 12 ? "rowStyle" : "",
			columnStyle: (col) => col.id == "city" ? "columnStyle" : "",
			footer: true
		});

		$$renderer.push(`<!----></div></div>`);
	});
}