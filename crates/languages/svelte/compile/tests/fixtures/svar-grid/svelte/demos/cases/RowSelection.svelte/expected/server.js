import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";

export default function RowSelection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = getData();

		const columns = [
			{ id: "id", width: 50 },
			{ id: "city", header: "City", width: 160 },
			{ id: "firstName", header: "First Name" },
			{ id: "lastName", header: "Last Name" },
			{ id: "companyName", header: "Company" }
		];

		let api = void 0;
		let s = 0;
		const updateSelected = () => s = api.getState().selectedRows;

		$$renderer.push(`<div style="padding: 20px;"><h4>Click on any cell to select. Selected:
		${$.escape(s.length ? s.join(", ") : "none")}</h4> <div>`);

		Grid($$renderer, { data, columns, onselectrow: updateSelected });
		$$renderer.push(`<!----></div></div>`);
	});
}