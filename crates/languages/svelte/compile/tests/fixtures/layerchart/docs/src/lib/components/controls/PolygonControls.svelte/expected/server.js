import * as $ from 'svelte/internal/server';
import { RangeField } from 'svelte-ux';

export default function PolygonControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { starInset = undefined, rotate = undefined, cornerRadius = 0 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex gap-2 mb-2 screenshot-hidden">`);

			if (starInset !== undefined) {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'inset',
					labelPlacement: 'left',
					min: -1,
					max: 1,
					step: 0.1,
					format: 'decimal',
					get value() {
						return starInset;
					},

					set value($$value) {
						starInset = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (rotate !== undefined) {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'rotate',
					labelPlacement: 'left',
					max: 360,
					get value() {
						return rotate;
					},

					set value($$value) {
						rotate = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (cornerRadius !== undefined) {
				$$renderer.push('<!--[0-->');

				RangeField($$renderer, {
					label: 'cornerRadius',
					labelPlacement: 'left',
					max: 50,
					get value() {
						return cornerRadius;
					},

					set value($$value) {
						cornerRadius = $$value;
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
		$.bind_props($$props, { starInset, rotate, cornerRadius });
	});
}