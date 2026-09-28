import * as $ from 'svelte/internal/server';
import { RangeField } from 'svelte-ux';

export default function PieChartControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { count = 60, value = 75 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex justify-self-center gap-2 mb-4 screenshot-hidden">`);

			RangeField($$renderer, {
				label: 'Segments',
				min: 2,
				get value() {
					return count;
				},

				set value($$value) {
					count = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Value',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { count, value });
	});
}