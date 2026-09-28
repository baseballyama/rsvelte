import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { Willow, Locale } from "@svar-ui/svelte-core";
import { repeatData, repeatColumns } from "../data";

export default function ReorderingBasic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const rows = 100;
		const cols = 20;
		const data = repeatData(rows, cols);
		const columns = repeatColumns(cols);

		Willow($$renderer, {
			children: ($$renderer) => {
				Locale($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div style="padding: 20px;"><div style="width: 800px; height: 500px;">`);
						Grid($$renderer, { data, columns, reorder: true });
						$$renderer.push(`<!----></div></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}