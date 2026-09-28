import * as $ from 'svelte/internal/server';
import { RangeField } from 'svelte-ux';

export default function VoronoiControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { radius = void 0 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="mb-4 screenshot-hidden">`);

			RangeField($$renderer, {
				label: 'Radius',
				max: 100,
				get value() {
					return radius;
				},

				set value($$value) {
					radius = $$value;
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
		$.bind_props($$props, { radius });
	});
}