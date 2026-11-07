import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";

export default function FillspaceColumns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = getData();

		const columns = [
			{ id: "id", width: 50 },
			{ id: "city", header: "City", width: 160 },
			{ id: "firstName", header: "First Name", flexgrow: 1 },
			{ id: "lastName", header: "Last Name", flexgrow: 1 },
			{ id: "companyName", header: "Company", flexgrow: 2 }
		];

		$$renderer.push(`<div style="padding: 20px;"><h4>Columns with flexible widths to fill the available space</h4> <div>`);
		Grid($$renderer, { data, columns });
		$$renderer.push(`<!----></div></div>`);
	});
}