import * as $ from 'svelte/internal/server';
import { RangeField, SelectField } from 'svelte-ux';

export default function GraticuleControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				stepX: 10,
				stepY: 10,
				projection: () => ({}),
				rotate: { yaw: 0, pitch: -30, roll: 20 }
			},
			projections
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[1fr_1fr_auto] gap-2 my-2 screenshot-hidden">`);

			SelectField($$renderer, {
				label: 'Projections',
				options: projections,
				clearable: false,
				toggleIcon: null,
				stepper: true,
				get value() {
					return config.projection;
				},

				set value($$value) {
					config.projection = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-2">`);

			RangeField($$renderer, {
				label: 'Yaw',
				min: -360,
				max: 360,
				get value() {
					return config.rotate.yaw;
				},

				set value($$value) {
					config.rotate.yaw = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Pitch',
				min: -90,
				max: 90,
				get value() {
					return config.rotate.pitch;
				},

				set value($$value) {
					config.rotate.pitch = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Roll',
				min: -180,
				max: 180,
				get value() {
					return config.rotate.roll;
				},

				set value($$value) {
					config.rotate.roll = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-2 gap-2 my-2">`);

			RangeField($$renderer, {
				label: 'Step X',
				min: 0,
				max: 180,
				get value() {
					return config.stepX;
				},

				set value($$value) {
					config.stepX = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Step Y',
				min: 0,
				max: 180,
				get value() {
					return config.stepY;
				},

				set value($$value) {
					config.stepY = $$value;
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