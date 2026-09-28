import * as $ from 'svelte/internal/server';
import { Field, RangeField, SelectField, Switch } from 'svelte-ux';

export default function GeoContextPlaygroundControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			projections,
			projection = void 0,
			scale = void 0,
			detailed = void 0,
			rotate = void 0
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
					return projection;
				},

				set value($$value) {
					projection = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Scale',
				min: -100,
				max: 3000,
				get value() {
					return scale;
				},

				set value($$value) {
					scale = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Detail',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							get checked() {
								return detailed;
							},

							set checked($$value) {
								detailed = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-[1fr_1fr_1fr] gap-2 my-2">`);

			RangeField($$renderer, {
				label: 'Yaw',
				min: -360,
				max: 360,
				get value() {
					return rotate.yaw;
				},

				set value($$value) {
					rotate.yaw = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Pitch',
				min: -90,
				max: 90,
				get value() {
					return rotate.pitch;
				},

				set value($$value) {
					rotate.pitch = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Roll',
				min: -180,
				max: 180,
				get value() {
					return rotate.roll;
				},

				set value($$value) {
					rotate.roll = $$value;
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
		$.bind_props($$props, { projection, scale, detailed, rotate });
	});
}