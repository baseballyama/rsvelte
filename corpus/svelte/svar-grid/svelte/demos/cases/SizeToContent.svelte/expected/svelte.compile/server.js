import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";

export default function SizeToContent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, allColumns } = getData();

		$$renderer.push(`<div style="padding: 20px;"><h4>DataGrid adjusts to the content ( 1 row )</h4> `);
		Grid($$renderer, { data: data.slice(0, 1), columns: allColumns.slice(0, 3) });
		$$renderer.push(`<!----></div> <div style="padding: 20px;"><h4>DataGrid adjusts to the content ( 1 row, flexible column widths )</h4> `);

		Grid($$renderer, {
			data: data.slice(0, 1),
			header: false,
			columns: [
				{ id: "id", width: 40 },
				{ id: "city", flexgrow: 1 },
				{ id: "email", flexgrow: 1 }
			]
		});

		$$renderer.push(`<!----></div> <div style="padding: 20px;"><h4>DataGrid adjusts to the content ( 10 rows )</h4> `);
		Grid($$renderer, { data: data.slice(0, 10), columns: allColumns.slice(0, 5) });
		$$renderer.push(`<!----></div> <div style="padding: 20px;"><h4>DataGrid adjusts to the content ( multiple rows )</h4> `);
		Grid($$renderer, { data, columns: allColumns });
		$$renderer.push(`<!----></div>`);
	});
}