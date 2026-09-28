import * as $ from 'svelte/internal/server';
import { RangeField } from 'svelte-ux';

export default function PolygonPlaygroundControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				points: 8,
				cornerRadius: 0,
				inset: 0,
				rotate: 0,
				scaleX: 1,
				scaleY: 1,
				skewX: 0,
				skewY: 0,
				tiltX: 0,
				tiltY: 0
			}
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-xs gap-2 mb-2 screenshot-hidden">`);

			RangeField($$renderer, {
				label: 'points',
				min: 3,
				max: 20,
				get value() {
					return config.points;
				},

				set value($$value) {
					config.points = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'inset',
				min: -1,
				max: 1,
				step: 0.1,
				format: 'decimal',
				get value() {
					return config.inset;
				},

				set value($$value) {
					config.inset = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'rotate',
				max: 360,
				get value() {
					return config.rotate;
				},

				set value($$value) {
					config.rotate = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'cornerRadius',
				max: 50,
				get value() {
					return config.cornerRadius;
				},

				set value($$value) {
					config.cornerRadius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'scaleX',
				min: -2,
				max: 2,
				step: 0.1,
				format: 'decimal',
				get value() {
					return config.scaleX;
				},

				set value($$value) {
					config.scaleX = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'scaleY',
				min: -2,
				max: 2,
				step: 0.1,
				format: 'decimal',
				get value() {
					return config.scaleY;
				},

				set value($$value) {
					config.scaleY = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'skewX',
				min: -50,
				max: 50,
				get value() {
					return config.skewX;
				},

				set value($$value) {
					config.skewX = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'skewY',
				min: -50,
				max: 50,
				get value() {
					return config.skewY;
				},

				set value($$value) {
					config.skewY = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'tiltX',
				min: -2,
				max: 2,
				step: 0.1,
				format: 'decimal',
				get value() {
					return config.tiltX;
				},

				set value($$value) {
					config.tiltX = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'tiltY',
				min: -2,
				max: 2,
				step: 0.1,
				format: 'decimal',
				get value() {
					return config.tiltY;
				},

				set value($$value) {
					config.tiltY = $$value;
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
		$.bind_props($$props, { config });
	});
}