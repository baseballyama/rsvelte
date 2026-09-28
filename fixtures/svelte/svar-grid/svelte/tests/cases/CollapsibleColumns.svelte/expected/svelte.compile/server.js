import * as $ from 'svelte/internal/server';
import { getData } from "../data";
import { Grid } from "../../src";
import { Willow, Locale } from "@svar-ui/svelte-core";

export default function CollapsibleColumns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, collapsibleColumns } = getData();

		Willow($$renderer, {
			children: ($$renderer) => {
				Locale($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="demo svelte-hlgz5" style="padding: 20px;"><div>`);
						Grid($$renderer, { data, columns: collapsibleColumns("first"), footer: true });
						$$renderer.push(`<!----></div></div> <div class="demo svelte-hlgz5" style="padding: 20px;"><div>`);
						Grid($$renderer, { data, columns: collapsibleColumns(), footer: true });
						$$renderer.push(`<!----></div></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}