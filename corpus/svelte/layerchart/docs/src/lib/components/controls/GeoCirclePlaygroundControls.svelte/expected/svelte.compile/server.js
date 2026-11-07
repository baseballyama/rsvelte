import * as $ from 'svelte/internal/server';
import { Field, SelectField, RangeField, ToggleGroup, ToggleOption } from 'svelte-ux';

export default function GeoCirclePlaygroundControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				example: 'single',
				projection: null,
				latitude: 0,
				longitude: 0,
				radius: 600,
				precision: 6
			},
			projections = []
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-2 gap-2 my-2 screenshot-hidden">`);

			Field($$renderer, {
				label: 'Example',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						inset: true,
						class: 'w-full',
						size: 'sm',
						get value() {
							return config.example;
						},

						set value($$value) {
							config.example = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'single',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Single`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'multi',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Multi`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

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

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Latitude',
				min: -90,
				max: 90,
				disabled: config.example != 'single',
				get value() {
					return config.latitude;
				},

				set value($$value) {
					config.latitude = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Longitude',
				min: -180,
				max: 180,
				disabled: config.example != 'single',
				get value() {
					return config.longitude;
				},

				set value($$value) {
					config.longitude = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Radius (km)',
				max: 6371,
				disabled: config.example != 'single',
				get value() {
					return config.radius;
				},

				set value($$value) {
					config.radius = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Precision',
				max: 90,
				disabled: config.example != 'single',
				get value() {
					return config.precision;
				},

				set value($$value) {
					config.precision = $$value;
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