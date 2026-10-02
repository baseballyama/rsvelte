import * as $ from 'svelte/internal/server';
import { Field, Slider, Willow, Locale } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData } from "../data";

export default function FixedColumns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { allData: data, allColumns } = getData();
		let left = 2;

		const columns = allColumns.map((c) => {
			if (c.id !== "id") c.editor = "text";

			return c;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Willow($$renderer, {
				children: ($$renderer) => {
					Locale($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div style="padding: 20px;"><h4>Table with fixed / resizable columns</h4> <div class="controls svelte-19qlfyz">`);

							Field($$renderer, {
								label: 'Fix columns',
								children: ($$renderer) => {
									Slider($$renderer, {
										min: 0,
										max: 4,
										get value() {
											return left;
										},

										set value($$value) {
											left = $$value;
											$$settled = false;
										}
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div> <div style="height: 415px; max-width: 800px;">`);
							Grid($$renderer, { data, columns, split: { left } });
							$$renderer.push(`<!----></div></div>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}