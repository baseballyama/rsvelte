import * as $ from 'svelte/internal/server';
import { Pager } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData } from "../data";

export default function Paging($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { allData, columns } = getData();
		let data = [];

		function setPage(ev) {
			const { from, to } = ev;

			data = allData.slice(from, to);
		}

		setPage({ from: 0, to: 8 });
		$$renderer.push(`<div style="padding: 20px;">`);
		Pager($$renderer, { total: allData.length, pageSize: 8, onchange: setPage });
		$$renderer.push(`<!----> <div>`);
		Grid($$renderer, { data, columns });
		$$renderer.push(`<!----></div></div>`);
	});
}