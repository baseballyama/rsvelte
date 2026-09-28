import * as $ from 'svelte/internal/server';
import { Slider, Field, Checkbox } from "@svar-ui/svelte-core";
import { Grid } from "../../src";
import { getData, repeatColumns } from "../data";

export default function SizeToContainer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data, columns, flexibleColumns } = getData();
		let w = 600;
		let h = 320;
		let psize = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div style="padding: 20px;"><h4>DataGrid adjusts to the container</h4> `);

			Field($$renderer, {
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'Fill screen',
						get value() {
							return psize;
						},

						set value($$value) {
							psize = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="controls svelte-yctoe6">`);

			if (!psize) {
				$$renderer.push('<!--[0-->');

				Slider($$renderer, {
					label: `Container width: ${$.stringify(w)}px`,
					min: 200,
					max: 800,
					get value() {
						return w;
					},

					set value($$value) {
						w = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Slider($$renderer, {
					label: `Container height: ${$.stringify(h)}px`,
					min: 200,
					max: 800,
					get value() {
						return h;
					},

					set value($$value) {
						h = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <h3>Columns with fixed widths</h3> <div class="container svelte-yctoe6"${$.attr_style(psize
				? "width:100%; height: 50%;"
				: `width:${w}px;height:${h}px`)}>`);

			Grid($$renderer, { data: data.slice(0, 15), columns });

			$$renderer.push(`<!----></div> <h3>Columns with flexible widths</h3> <div class="container svelte-yctoe6"${$.attr_style(psize
				? "width:100%; height: 50%;"
				: `width:${w}px;height:${h}px`)}>`);

			Grid($$renderer, { data: data.slice(0, 15), columns: flexibleColumns });

			$$renderer.push(`<!----></div> <h3>A lot of columns</h3> <div class="container svelte-yctoe6"${$.attr_style(psize
				? "width:100%; height: 50%;"
				: `width:${w}px;height:${h}px`)}>`);

			Grid($$renderer, { data: data.slice(0, 15), columns: repeatColumns(50) });
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