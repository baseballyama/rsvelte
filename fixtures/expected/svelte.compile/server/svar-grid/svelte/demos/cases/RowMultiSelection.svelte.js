import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";

export default function RowMultiSelection($$renderer, $$props) {
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
		let s = [];
		const updateSelected = () => s = api.getState().selectedRows;

		$$renderer.push(`<div style="padding: 20px;"><h4>Click cells using Ctrl/Shift keys. Selected:
		${$.escape(s.length ? s.join(", ") : "none")}</h4> <div>`);

		Grid($$renderer, {
			data,
			columns,
			multiselect: true,
			onselectrow: updateSelected
		});

		$$renderer.push(`<!----></div></div>`);
	});
}