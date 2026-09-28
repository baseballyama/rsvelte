import * as $ from 'svelte/internal/server';
import { Button, ButtonGroup, Field, RangeField } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import { curveCatmullRomClosed } from 'd3-shape';

export default function GeoPathGlobeControls2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { timer, curve = undefined, minArea = undefined, velocity = 3 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col gap-2 mb-4 screenshot-hidden">`);

			if (minArea !== undefined) {
				$$renderer.push(`<!--[0--><div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-2">`);

				CurveMenuField($$renderer, {
					showOpenClosed: true,
					get value() {
						return curve;
					},

					set value($$value) {
						curve = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				RangeField($$renderer, {
					label: 'Min area',
					min: 0,
					max: 3,
					step: 0.01,
					get value() {
						return minArea;
					},

					set value($$value) {
						minArea = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="mb-2 flex gap-6">`);

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
		$.bind_props($$props, { curve, minArea, velocity });
	});
}