import * as $ from 'svelte/internal/server';
import { Field, RangeField, Switch } from 'svelte-ux';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function TransformContextPlaygroundControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			config = {
				pointCount: 500,
				angle: 137.5,
				showPoints: true,
				showPath: false,
				tweened: true,
				curve: undefined
			}
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid grid-cols-[1fr_auto_auto] gap-2 mb-2 screenshot-hidden">`);

			RangeField($$renderer, {
				label: 'Angle',
				min: 1,
				max: 360,
				get value() {
					return config.angle;
				},

				set value($$value) {
					config.angle = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Tweened',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return config.tweened;
							},

							set checked($$value) {
								config.tweened = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Show path',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return config.showPath;
							},

							set checked($$value) {
								config.showPath = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----></div> <div class="grid grid-cols-[1fr_1fr_auto] gap-2 mb-6 screenshot-hidden">`);

			RangeField($$renderer, {
				label: 'Points',
				min: 1,
				max: 2000,
				get value() {
					return config.pointCount;
				},

				set value($$value) {
					config.pointCount = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			CurveMenuField($$renderer, {
				showOpenClosed: true,
				get value() {
					return config.curve;
				},

				set value($$value) {
					config.curve = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Show points',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return config.showPoints;
							},

							set checked($$value) {
								config.showPoints = $$value;
								$$settled = false;
							}
						});
					}
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