import * as $ from 'svelte/internal/server';
import { getData } from "../../data";
import { Grid } from "../../../src";
import { Willow, Locale } from "@svar-ui/svelte-core";

export default function SpansVerticalText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tmp = getData(),
			data = tmp.data,
			columns = tmp.columnsSpansVertical;

		data.length = 5;

		let api = void 0;

		Willow($$renderer, {
			children: ($$renderer) => {
				Locale($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="demo svelte-1l9cqfc" style="padding: 20px;"><div style="margin-top: 20px;">`);
						Grid($$renderer, { data, columns, footer: true });
						$$renderer.push(`<!----></div></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}