import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";
import { Willow, Locale } from "@svar-ui/svelte-core";

export default function TableHeaderFooterVertical($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			allData: data,
			columnsVertical: columns,
			columnsSpansVertical: scolumns
		} = getData();

		Willow($$renderer, {
			children: ($$renderer) => {
				Locale($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="demo svelte-1i2jdcc">`);
						Grid($$renderer, { data, columns, footer: true });
						$$renderer.push(`<!----></div> <div class="demo svelte-1i2jdcc">`);
						Grid($$renderer, { data, columns: scolumns, footer: true });
						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}