import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid } from "../../src";

export default function AutoConfigColumns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { allData } = getData();
		const config = { editor: "text" };

		$$renderer.push(`<div style="padding: 20px;"><div style="height: 620px; max-width: 800px;">`);
		Grid($$renderer, { data: allData, autoConfig: config });
		$$renderer.push(`<!----></div></div>`);
	});
}