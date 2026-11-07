import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { repeatData, repeatColumns } from "../data";

export default function Reordering($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const rows = 100;
		const cols = 20;
		const data = repeatData(rows, cols);
		const columns = repeatColumns(cols);
		const columnsWithDraggable = repeatColumns(cols);
		const columnsWithSelectiveDraggable = repeatColumns(cols);

		columnsWithDraggable[0].draggable = true;
		columnsWithSelectiveDraggable[0].draggable = (row) => row.id % 2 === 1;
		$$renderer.push(`<div style="padding: 20px;"><h4>Base reordering</h4> <div style="width: 800px; height: 400px;">`);
		Grid($$renderer, { data, columns, reorder: true });
		$$renderer.push(`<!----></div></div> <div style="padding: 20px;"><h4>Reordering with a drag handle</h4> <div style="width: 800px; height: 400px;">`);

		Grid($$renderer, {
			data,
			columns: columnsWithDraggable,
			footer: true,
			reorder: true
		});

		$$renderer.push(`<!----></div></div> <div style="padding: 20px;"><h4>Restrictive drag handlers (rows without drag handlers cannot be moved)</h4> <div style="width: 800px; height: 400px;">`);

		Grid($$renderer, {
			data,
			columns: columnsWithSelectiveDraggable,
			footer: true,
			reorder: true
		});

		$$renderer.push(`<!----></div></div>`);
	});
}