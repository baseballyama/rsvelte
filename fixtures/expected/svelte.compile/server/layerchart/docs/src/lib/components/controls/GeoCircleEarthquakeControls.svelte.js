import * as $ from 'svelte/internal/server';
import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';

export default function GeoCircleEarthquakeControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { timer, velocity = 3 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex gap-2 items-end mb-4 screenshot-hidden"><div class="mb-2 flex gap-6">`);

			Field($$renderer, {
				label: 'Spin:',
				dense: true,
				labelPlacement: 'left',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						ButtonGroup($$renderer, {
							size: 'sm',
							variant: 'fill-light',
							children: ($$renderer) => {
								Button($$renderer, {
									disabled: timer.running,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Start`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									disabled: !timer.running,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Stop`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Velocity:',
				min: -10,
				max: 10,
				disabled: !timer.running,
				labelPlacement: 'left',
				get value() {
					return velocity;
				},

				set value($$value) {
					velocity = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { velocity });
	});
}