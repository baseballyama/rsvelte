import * as $ from 'svelte/internal/server';
import { RangeField } from 'svelte-ux';

export default function ArcControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = undefined, segments = undefined } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-flow-col gap-3 mb-2 screenshot-hidden">`);

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

			$$renderer.push(`<!----> `);

			if (segments !== undefined) {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'Segments',
					min: 2,
					get value() {
						return segments;
					},

					set value($$value) {
						segments = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value, segments });
	});
}