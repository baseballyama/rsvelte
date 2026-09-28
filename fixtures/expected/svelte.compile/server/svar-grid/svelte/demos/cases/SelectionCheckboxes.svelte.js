import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import SelectionCheckboxCell from "../custom/SelectionCheckboxCell.svelte";
import SelectionCheckboxBind from "../custom/SelectionCheckboxBind.svelte";
import { getData } from "../data";

export default function SelectionCheckboxes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = getData();

		const columns = [
			{ id: "selected", cell: SelectionCheckboxCell, width: 36 },
			{ id: "city", header: "City", width: 160 },
			{ id: "firstName", header: "First Name" },
			{ id: "lastName", header: "Last Name" },
			{ id: "companyName", header: "Company" }
		];

		const columnsBind = [
			{ id: "selected", cell: SelectionCheckboxBind, width: 36 },
			{ id: "city", header: "City", width: 160 },
			{ id: "firstName", header: "First Name" },
			{ id: "lastName", header: "Last Name" },
			{ id: "companyName", header: "Company" }
		];

		$$renderer.push(`<div class="demo svelte-1xzn48y" style="padding: 20px;"><h4>Select only by checkboxes</h4> <div>`);
		Grid($$renderer, { data, columns, select: false });
		$$renderer.push(`<!----></div></div> <div class="demo svelte-1xzn48y" style="padding: 20px;"><h4>Select by checkboxes and clicking</h4> <div>`);

		Grid($$renderer, {
			data,
			columns: columnsBind,
			multiselect: true,
			selectedRows: [13]
		});

		$$renderer.push(`<!----></div></div>`);
	});
}