import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid } from "../../src";

export default function TableHeaderFooterVertical($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tmp = getData(),
			data = tmp.data,
			columns = tmp.columnsVertical,
			scolumns = tmp.columnsSpansVertical;

		data.length = 5;
		$$renderer.push(`<div class="demo svelte-1wuh3lt" style="padding: 20px;"><div>`);
		Grid($$renderer, { data, columns, footer: true });
		$$renderer.push(`<!----></div> <div style="margin-top: 20px;">`);
		Grid($$renderer, { data, columns: scolumns, footer: true });
		$$renderer.push(`<!----></div></div>`);
	});
}