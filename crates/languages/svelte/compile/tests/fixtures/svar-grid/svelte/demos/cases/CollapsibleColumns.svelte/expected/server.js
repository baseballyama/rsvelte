import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid } from "../../src";

export default function CollapsibleColumns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, allData, collapsibleColumns } = getData();

		$$renderer.push(`<div class="demo" style="padding: 20px;"><div style="height: 510px;">`);
		Grid($$renderer, { data: allData, columns: collapsibleColumns(), footer: true });
		$$renderer.push(`<!----></div></div> <div class="demo" style="padding: 20px;"><div>`);
		Grid($$renderer, { data, columns: collapsibleColumns("first") });
		$$renderer.push(`<!----></div></div>`);
	});
}