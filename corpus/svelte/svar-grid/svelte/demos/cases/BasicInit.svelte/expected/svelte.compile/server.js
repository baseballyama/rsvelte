import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid } from "../../src/";

export default function BasicInit($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, columns } = getData();

		$$renderer.push(`<div style="padding: 20px;"><div>`);
		Grid($$renderer, { data, columns });
		$$renderer.push(`<!----></div></div>`);
	});
}