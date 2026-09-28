import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";
import { Willow, Locale } from "@svar-ui/svelte-core";

export default function TreeMode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { treeData, treeColumns } = getData();

		Willow($$renderer, {
			children: ($$renderer) => {
				Locale($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div style="padding: 20px; width: 960px;">`);
						Grid($$renderer, { tree: true, data: treeData, columns: treeColumns });
						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}