import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";
import { Willow, Locale } from "@svar-ui/svelte-core";

export default function LocalData($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, columns } = getData();

		Willow($$renderer, {
			children: ($$renderer) => {
				Locale($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div style="padding: 20px; width: 360px">`);
						Grid($$renderer, { data, columns });
						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}