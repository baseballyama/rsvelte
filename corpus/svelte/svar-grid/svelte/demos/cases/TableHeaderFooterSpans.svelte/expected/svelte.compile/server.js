import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid, HeaderMenu } from "../../src/";

export default function TableHeaderFooterSpans($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, columnsSpans } = getData();
		let api = void 0;

		$$renderer.push(`<div class="demo svelte-1dxi0as" style="padding: 20px;"><div>`);

		HeaderMenu($$renderer, {
			api,
			children: ($$renderer) => {
				Grid($$renderer, { data, columns: columnsSpans, footer: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	});
}