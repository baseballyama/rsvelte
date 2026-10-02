import * as $ from 'svelte/internal/server';
import { Field, Slider } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData } from "../data";

export default function FixedColumns($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, allColumns } = getData();
		let left = 2;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div style="padding: 20px;"><h4>Drag the slider to fix columns on the left</h4> <div class="controls svelte-hadqve">`);

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

			$$renderer.push(`<!----></div> <div style="max-width: 800px;">`);
			Grid($$renderer, { data, columns: allColumns, split: { left } });
			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}