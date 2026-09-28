import * as $ from 'svelte/internal/server';
import { Pane, Splitpanes } from 'svelte-splitpanes';
import RangeSlider from 'svelte-range-slider-pips';

export default function Code($$renderer) {
	let value = [50];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		RangeSlider($$renderer, {
			float: true,
			min: 0,
			step: 0.01,
			max: 100,
			get values() {
				return value;
			},

			set values($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Splitpanes($$renderer, {
			style: 'height: 400px',
			children: ($$renderer) => {
				Pane($$renderer, {
					get size() {
						return value[0];
					},

					set size($$value) {
						value[0] = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<span>${$.escape(Math.round(value[0]))}%</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Pane($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<span>Auto-Calculated</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}